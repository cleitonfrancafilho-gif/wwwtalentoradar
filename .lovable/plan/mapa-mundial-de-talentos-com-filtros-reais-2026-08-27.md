# Mapa mundial de talentos com filtros reais

## Objetivo
Transformar o Mapa de Talentos em uma visualização mundial real, baseada na localização cadastrada pelos atletas, com filtros por país, estado, cidade, esporte, posição e características físicas.

## Implementação

### 1. Dados geográficos estruturados
- Adicionar ao perfil os campos `country`, `state`, `city`, `latitude` e `longitude`, preservando o campo de endereço existente.
- Atualizar a edição de perfil do atleta para cadastrar país, estado e cidade separadamente.
- Usar coordenadas persistidas para posicionar cada atleta corretamente, sem listas fixas de cidades ou números demonstrativos.

### 2. Mapa mundial real
- Manter o Leaflet compatível com React 18 e usar um mapa-base mundial com países, estados/províncias, cidades, ruas e controles nativos de zoom/pan.
- Iniciar em visão global e ajustar automaticamente a área exibida aos atletas encontrados.
- Agrupar atletas próximos por cidade/região em marcadores de densidade; ao clicar, mostrar local, quantidade, modalidades e acesso aos perfis.
- Remover completamente os clusters fictícios atuais.
- Exibir estados vazios claros quando não houver atletas localizados ou quando algum perfil ainda não tiver coordenadas.

### 3. Filtros
- Adicionar filtros encadeados de País → Estado → Cidade, preenchidos pelos dados reais encontrados.
- Manter filtros de modalidade e posição.
- Adicionar painel de características físicas com faixas de altura, peso e envergadura, além de pé dominante.
- Mostrar a quantidade real de atletas após todos os filtros e oferecer ação para limpar filtros.

### 4. Experiência e responsividade
- Organizar filtros em painel recolhível para não reduzir excessivamente a área do mapa em celulares.
- Mostrar resumo dos filtros ativos e lista compacta dos atletas visíveis.
- Garantir legibilidade nos temas claro e escuro e manter o menu inferior atual sem alterações.

### 5. Validação
- Aplicar a migração de campos geográficos no Lovable Cloud com permissões e políticas existentes preservadas.
- Testar abertura, zoom, arraste, filtros combinados, popups e navegação para perfis em desktop e mobile.
- Confirmar ausência de erros de console e comportamento correto quando o banco estiver vazio.

## Detalhes técnicos
- O mapa atual só reconhece uma lista fixa de cidades brasileiras e injeta dados fictícios quando não encontra resultados; isso será substituído por coordenadas e localizações estruturadas reais.
- Perfis antigos continuarão válidos, mas só aparecerão no mapa após terem país/estado/cidade e coordenadas preenchidos.
- A localização exata do atleta não será exposta: marcadores usarão o centro aproximado da cidade/região, protegendo endereço residencial.
