// app/context/GameContext.js
"use client";

import React, { createContext, useState, useContext } from 'react';
import { boardSquares } from '../data/board';
import { questions } from '../data/questions';

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [players, setPlayers] = useState([
    { id: 1, position: 0, color: '#ff414d', status: 'home' },
    { id: 2, position: 0, color: '#41a9ff', status: 'home' },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [gameMessage, setGameMessage] = useState('Lojtari 1, hidh një 6 për të filluar!');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  const switchTurn = () => {
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    const nextPlayer = players[nextPlayerIndex];
    let message = `Radha e Lojtarit ${nextPlayer.id}. `;
    if (nextPlayer.status === 'home') message += 'Hidh një 6 për të filluar!';
    else if (nextPlayer.status === 'jailed') message += 'Hidh një 6 për të dalë nga Drejtoria!';
    else if (nextPlayer.status === 'blocked') message += 'Je i bllokuar për këtë radhë.';
    else message += 'Hidh zarin!';
    setGameMessage(message);
    setDiceValue(null);
    setIsRolling(false);
  };

  // Called when the button (and dice) are triggered; actual result comes later
  const rollDice = () => {
    if (isRolling || winner) return;
    setIsRolling(true);
  };

  // Called by Dice when the animation finishes with a value
  const handleDiceResult = (roll) => {
    setDiceValue(roll);
    const currentPlayer = players[currentPlayerIndex];
    setTimeout(() => {
      switch (currentPlayer.status) {
        case 'home':
          handleHomeRoll(currentPlayer, roll);
          break;
        case 'jailed':
          handleJailRoll(currentPlayer, roll);
          break;
        case 'blocked':
          handleBlockedTurn(currentPlayer);
          break;
        default:
          handleActiveRoll(currentPlayer, roll);
      }
    }, 300);
  };

  const handleHomeRoll = (player, roll) => {
    if (roll === 6) {
      setPlayers(prev =>
        prev.map(p => (p.id === player.id ? { ...p, status: 'active', position: 1 } : p))
      );
      setGameMessage(`Lojtari ${player.id} hodhi 6! Lëviz në fushën 1. Hidh zarin përsëri!`);
      setIsRolling(false); // same player may roll again
    } else {
      setGameMessage(`Lojtari ${player.id} hodhi ${roll}. Duhet një 6 për të filluar.`);
      setTimeout(switchTurn, 800);
    }
  };

  const handleJailRoll = (player, roll) => {
    if (roll === 6) {
      setPlayers(prev =>
        prev.map(p => (p.id === player.id ? { ...p, status: 'active' } : p))
      );
      setGameMessage(`Lojtari ${player.id} hodhi 6 dhe u lirua! Mund të lëvizësh radhën tjetër.`);
      setTimeout(switchTurn, 800);
    } else {
      setGameMessage(`Lojtari ${player.id} hodhi ${roll}. Nuk u lirove nga Drejtoria.`);
      setTimeout(switchTurn, 800);
    }
  };

  const handleBlockedTurn = (player) => {
    setPlayers(prev =>
      prev.map(p => (p.id === player.id ? { ...p, status: 'active' } : p))
    );
    setGameMessage(`Lojtari ${player.id} e kaloi radhën e bllokimit.`);
    setTimeout(switchTurn, 800);
  };

  const handleActiveRoll = (player, roll) => {
    const newPosition = player.position + roll;
    movePlayer(player, newPosition, `Lojtari ${player.id} hodhi ${roll}.`);
  };

  const movePlayer = (player, newPosition, initialMessage) => {
    let finalPosition = Math.max(1, newPosition);
    if (finalPosition >= boardSquares.length - 1) {
      finalPosition = boardSquares.length - 1;
    }

    const targetSquare = boardSquares.find(s => s.id === finalPosition);
    let knockBackMessage = '';
    const updatedPlayers = players.map(p => {
      if (p.id !== player.id && p.position === finalPosition && targetSquare.type !== 'rest_safe') {
        knockBackMessage = ` Lojtari ${p.id} u kthye në fillim!`;
        return { ...p, position: 0, status: 'home' };
      }
      return p;
    });

    const finalPlayersState = updatedPlayers.map(p =>
      p.id === player.id ? { ...p, position: finalPosition } : p
    );
    setPlayers(finalPlayersState);
    setGameMessage(`${initialMessage} Lëvizi në fushën ${finalPosition}.${knockBackMessage}`);

    const currentPlayerInNewState = finalPlayersState.find(p => p.id === player.id);
    handleSquareAction(currentPlayerInNewState, targetSquare);
  };

  const handleSquareAction = (player, square) => {
    let actionTaken = false;

    const performAction = () => {
      switch (square.type) {
        case 'bonus':
          actionTaken = true;
          movePlayer(player, player.position + square.action.value, `Bonus!`);
          break;
        case 'risk_back':
          actionTaken = true;
          movePlayer(player, player.position - square.action.value, `Rrezik!`);
          break;
        case 'penalty':
          actionTaken = true;
          if (square.id === 58) {
            // Drejtoria / jailed
            setPlayers(prev =>
              prev.map(p => (p.id === player.id ? { ...p, position: square.id, status: 'jailed' } : p))
            );
            setGameMessage(square.action.message);
          } else {
            movePlayer(player, square.action.value, square.action.message);
          }
          break;
        case 'block':
          actionTaken = true;
          setPlayers(prev =>
            prev.map(p => (p.id === player.id ? { ...p, status: 'blocked' } : p))
          );
          setGameMessage(`Lojtari ${player.id} u bllokua për 1 radhë!`);
          break;
        case 'theory_question':
        case 'practical_question':
          actionTaken = true;
          {
            const questionType = square.type.split('_')[0];
            const list = questions[questionType] || [];
            const randomQuestion = list[Math.floor(Math.random() * list.length)];
            setModalContent({ type: 'question', data: randomQuestion, player });
            setIsModalOpen(true);
            return; // wait for modal answer
          }
        case 'finish':
          setWinner(player);
          setGameMessage(`Lojtari ${player.id} fitoi! Urime!`);
          setIsRolling(true);
          return;
        default:
          break;
      }

      if (actionTaken) {
        setTimeout(switchTurn, 1000);
      } else {
        switchTurn();
      }
    };

    setTimeout(performAction, 800);
  };

  const handleQuestionAnswer = (player, question, answer) => {
    setIsModalOpen(false);
    setModalContent(null);

    let message = '';
    let newPosition = player.position;

    if (answer === question.answer) {
      newPosition += question.reward;
      message = `Përgjigje e saktë! +${question.reward} fusha.`;
    } else {
      newPosition -= question.penalty;
      message = `Përgjigje e gabuar! -${question.penalty} fusha.`;
    }

    movePlayer(player, newPosition, message);
  };

  const value = {
    players,
    currentPlayerIndex,
    diceValue,
    gameMessage,
    isModalOpen,
    modalContent,
    winner,
    isRolling,
    rollDice,            // trigger animation
    handleDiceResult,    // consume roll after animation
    handleQuestionAnswer,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
