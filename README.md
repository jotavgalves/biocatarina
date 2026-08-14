# Bio Catarina

Link-in-bio da **Catarina Queiroz Clínica Estética**, recriado em estrutura própria e adaptado à identidade visual do site principal.

## Edição rápida

Todo o conteúdo editável está centralizado em `content.js`:

- textos;
- imagens do carrossel;
- links;
- WhatsApp;
- localização;
- serviços em destaque;
- cores da identidade;
- visibilidade dos itens;
- velocidade e autoplay do carrossel.

Itens com `visible: false` não aparecem. Links com `url: ""` também são ocultados automaticamente.

## Arquivos

- `index.html` — estrutura semântica da página;
- `styles.css` — visual e responsividade;
- `content.js` — conteúdo/configuração editável;
- `app.js` — renderização, carrossel, swipe e interações;
- `assets/catarina-mark.svg` — elemento visual da marca.

## Publicação

É um site estático, sem etapa de build. Pode ser publicado diretamente no Cloudflare Pages, GitHub Pages, Vercel ou qualquer hospedagem estática usando a raiz do repositório como diretório público.
