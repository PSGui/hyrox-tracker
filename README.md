# HYROX Tracker V1

PWA pessoal para iPhone, sem conta e sem backend.

## Funcionalidades
- Dashboard diário: calorias, proteína, peso, média de 7 dias e treino planeado.
- Alimentação por gramas e macros, com base inicial de alimentos e alimentos personalizados.
- Peso e medidas corporais com histórico e gráfico.
- Plano semanal de treino já carregado.
- Registo de séries: exercício, carga, repetições e RPE.
- Corrida/HYROX: duração, distância, pace calculado, FC média, RPE e notas.
- Guia Z1–Z5.
- Backup JSON, exportação CSV e importação de backup.
- Funciona offline depois da primeira abertura através de service worker.

## Dados iniciais
- Meta: 2700 kcal / 165 g proteína / 340 g hidratos / 75 g gordura.
- Peso inicial em 14/09/2026: 78,7 kg.
- Refeição de 14/09/2026 pré-carregada com maçã, massa, atum, 4 ovos (~210 g) e 10 g de azeite.

## Instalar no iPhone
A aplicação precisa de ser servida por HTTPS para funcionar como PWA.

### Opção simples: GitHub Pages
1. Criar um repositório novo no GitHub.
2. Fazer upload de todos os ficheiros desta pasta para a raiz do repositório.
3. Settings → Pages → Deploy from a branch → `main` / root.
4. Abrir o URL gerado no Safari do iPhone.
5. Partilhar → Adicionar ao ecrã principal.

### Alternativa
Pode ser publicada em qualquer alojamento estático HTTPS, como Netlify, Cloudflare Pages ou Vercel.

## Nota importante
Os dados ficam guardados localmente no browser/iPhone. Exportar periodicamente um backup JSON é recomendado.
