# ponytail: build fora da instância. A t3.micro do lab é CPU burstable e, sem
# créditos de sobra, `npm run build` (webpack) dentro do container trava por
# minutos. Build local/CI (`npm run build`, output "standalone") antes do zip
# do deploy; este Dockerfile só empacota o artefato já compilado.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.js"]
