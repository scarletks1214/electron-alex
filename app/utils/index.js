const path = require("path");

export const billingFileFormats = [
  { name: "CSV", format: "aiomoji" },
  { name: "Aiomoji", format: "aiomoji" },
  { name: "ANB AIO", format: "anbaio" },
  { name: "Balkobot", format: "balko" },
  { name: "BNB", format: "bnb" },
  { name: "Candypreme", format: "candypreme" },
  { name: "Cinnasole", format: "cinnasole" },
  { name: "Cybersole 4.0", format: "cyber" },
  { name: "Dashe v3", format: "dashev3" },
  { name: "Eve AIO", format: "eveaio" },
  { name: "Hastey", format: "hastey" },
  { name: "Kodai", format: "kodai" },
  { name: "NSB", format: "NSB" },
  { name: "Oculus AIO", format: "oculus" },
  { name: "Phantom", format: "phantom" },
  { name: "Prism AIO", format: "prism" },
  { name: "Project Destroyer (PD)", format: "pd" },
  { name: "Sneaker_Copter", format: "sneaker_copter" },
  { name: "Sole AIO", format: "soleaio" },
  { name: "Sole_Terminator", format: "sole_terminator" },
  { name: "TheKickStation (TKS)", format: "TKS" },
  { name: "What Bot", format: "whatbot" },
  { name: "Yitian", format: "yitan" }
];

export const socketUrl = "ws://18.205.191.187:3001";

export const basicURL =
  process.env.NODE_ENV === "development"
    ? "bin"
    : path.join(process.resourcesPath, "bin");
