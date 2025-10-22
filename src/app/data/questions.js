// app/data/questions.js
export const questions = {
  theory: [
    {
      question: "Cili është funksioni kryesor i një CPU?",
      options: ["Memorja afatgjatë", "Përpunimi i të dhënave", "Shfaqja grafike", "Lidhja me internetin"],
      answer: "Përpunimi i të dhënave",
      reward: 2,
      penalty: 2,
    },
    {
      question: "Çfarë do të thotë shkurtimi 'RAM'?",
      options: ["Read-Only Memory", "Random Access Memory", "Real-time Application Module", "Remote Access Machine"],
      answer: "Random Access Memory",
      reward: 3,
      penalty: 1,
    },
  ],
  practical: [
    {
      question: "Ju duhet të lidhni një kompjuter me një printer lokal. Cilin port do të përdornit më shpesh?",
      options: ["HDMI", "Ethernet", "USB", "VGA"],
      answer: "USB",
      reward: 3,
      penalty: 2,
    },
    {
      question: "Një klient ankohet se kompjuteri i tij është i ngadaltë. Cili është hapi i parë diagnostikues?",
      options: ["Riformatimi i hard diskut", "Kontrolli i Task Manager për proceset", "Ndryshimi i kartës grafike", "Pastrimi i ekranit"],
      answer: "Kontrolli i Task Manager për proceset",
      reward: 4,
      penalty: 3,
    },
  ],
};
