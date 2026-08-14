/*
 * TODO EDITÁVEL
 * Altere textos, links, imagens e cores somente neste arquivo.
 * O app esconde automaticamente links com url vazia e itens com visible: false.
 */
window.BIO_CONFIG = {
  site: {
    title: "Catarina Queiroz | Clínica Estética",
    description: "Catarina Queiroz Clínica Estética — links, agendamento e localização.",
    brandLine1: "CATARINA",
    brandLine2: "QUEIROZ",
    brandSubtitle: "CLÍNICA ESTÉTICA",
    location: "Boa Viagem • Recife",
    copyright: "© 2026 Catarina Queiroz Clínica Estética.",
    footerNote: "Estética facial e corporal com atendimento personalizado."
  },

  theme: {
    navy: "#02111f",
    navySoft: "#263746",
    cream: "#fffaf6",
    champagne: "#f3e8df",
    rose: "#b98578",
    roseDark: "#7a4e48",
    gold: "#c9a86a",
    goldLight: "#e6cf97",
    ink: "#071827",
    muted: "#526176"
  },

  carousel: {
    intervalMs: 4800,
    autoplay: true,
    slides: [
      {
        visible: true,
        image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=85&w=1200&auto=format&fit=crop",
        imagePosition: "center",
        eyebrow: "Catarina Queiroz",
        title: "Beleza com naturalidade",
        subtitle: "Estética facial e corporal em Boa Viagem"
      },
      {
        visible: true,
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=85&w=1200&auto=format&fit=crop",
        imagePosition: "center",
        eyebrow: "Cuidado direcionado",
        title: "Avaliação personalizada",
        subtitle: "Cada protocolo começa entendendo você"
      },
      {
        visible: true,
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=85&w=1200&auto=format&fit=crop",
        imagePosition: "center",
        eyebrow: "Experiência premium",
        title: "Técnica, cuidado e leveza",
        subtitle: "Protocolos planejados com segurança"
      }
    ]
  },

  featured: {
    visible: true,
    icon: "calendar",
    title: "Agendar avaliação estética",
    subtitle: "Fale com a clínica pelo WhatsApp",
    url: "https://wa.me/5581989844806?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o."
  },

  links: [
    {
      visible: false,
      icon: "whatsapp",
      label: "Agendar pelo WhatsApp",
      detail: "Atendimento com hora marcada",
      url: "https://wa.me/5581989844806?text=Ol%C3%A1%2C%20vim%20pelo%20site%20e%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o."
    },
    {
      visible: false,
      icon: "instagram",
      label: "Instagram Oficial",
      detail: "Acompanhe resultados e novidades",
      url: ""
    },
    {
      visible: true,
      icon: "map",
      label: "Localização da Clínica",
      detail: "R. Ribeiro de Brito, 554 — Boa Viagem",
      url: "https://www.google.com/maps/search/?api=1&query=R.%20Ribeiro%20de%20Brito%2C%20554%20Boa%20Viagem%20Recife%20PE"
    },
    {
      visible: true,
      icon: "globe",
      label: "Site Oficial",
      detail: "Conheça a Catarina Queiroz Clínica Estética",
      url: "https://catarinaqueiroz.com.br/"
    }
  ],

  bio: {
    visible: true,
    quote: "Uma experiência de cuidado que une técnica, atendimento humanizado e protocolos personalizados para valorizar sua beleza com naturalidade.",
    location: "Boa Viagem • Recife • PE"
  },

  services: {
    visible: true,
    items: [
      { label: "Limpeza de Pele" },
      { label: "Drenagem Facial" },
      { label: "Peeling Químico" },
      { label: "Drenagem HD" },
      { label: "Botox" },
      { label: "Endolaser" }
    ]
  }
};
