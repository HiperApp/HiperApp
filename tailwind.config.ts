import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Paleta oficial do HiperApp (extraída do material de marca)
        hiper: {
          red: "#E2333D", // cor principal / marca
          navy: "#345B99", // cor secundária / botões e ícones
          steel: "#79A8C4", // cor de apoio / gráficos
          mist: "#E9F1F7", // fundo suave
          white: "#FFFFFF",
        },
        status: {
          green: "#2E9E5B",
          yellow: "#E0A500",
          red: "#D93B3B",
        },
      },
      fontSize: {
        // Escala pensada para leitura confortável por idosos
        base: "17px",
      },
      borderRadius: {
        card: "20px",
        button: "16px",
      },
      boxShadow: {
        card: "0 4px 20px rgba(52, 91, 153, 0.08)",
        soft: "0 2px 10px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
