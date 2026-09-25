# Infraestrutura

O ambiente local está em `../docker-compose.yml`. A publicação em Vercel e Render
será configurada na ST-02, após definição das contas e secrets de deploy.

Pendência de arquitetura: PostgreSQL gratuito do Render expira após 30 dias.
Antes do deploy, definir hospedagem persistente compatível com o objetivo de custo zero.
Fonte: https://render.com/docs/free
