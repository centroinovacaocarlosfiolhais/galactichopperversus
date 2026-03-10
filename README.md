![Galatic Hopper VS](https://github.com/centroinovacaocarlosfiolhais/galactichopperversus/blob/main/GalaticHopperVS.png)
# 🚀 Galactic Hopper VS

Jogo multijogador versus em tempo real — estilo Frogger espacial.

## Jogar localmente

```bash
# Windows: duplo clique em jogar.bat
# Mac/Linux:
npm install
npm start
```

Abre `http://localhost:3000` no browser.  
Para jogar em dois PCs na mesma rede, usa `http://<IP>:3000`.

## Deploy no Render.com

1. Faz push para GitHub
2. No Render: **New → Web Service** → liga o repositório
3. Runtime: **Node**
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Partilha o URL do Render com o adversário

## Regras

- Chega à **Nave-Mãe** (topo) para capturar docas
- **Roubar** a doca do adversário vale pontos extra
- **Wormholes** teletransportam e dão invencibilidade
- **Buraco Negro** persegue quem lidera
- Ao aterrar fazes spawn imediato — sem espera
- 5 vidas · 3 minutos · mais docas/pontos vence

## Ficheiros

```
galactic-hopper-versus.html   ← jogo completo (HTML/JS/CSS)
server.js                     ← servidor WebSocket + HTTP
package.json                  ← dependências Node.js
jogar.bat                     ← atalho Windows
```
