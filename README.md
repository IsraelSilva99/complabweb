# CompLab Advanced

![Logo](assets/microscope-logo.png)

**CompLab Advanced** é um sistema web para gerenciamento de laboratórios clínicos, projetado para facilitar o atendimento de pacientes, configurações de banco de dados e outras operações administrativas. O sistema inclui uma interface de login, um dashboard com navegação intuitiva e páginas dedicadas para cadastro de pacientes e novos atendimentos.

## Índice

- [CompLab Advanced](#complab-advanced)
  - [Índice](#índice)
  - [Funcionalidades](#funcionalidades)
  - [Estrutura do Projeto](#estrutura-do-projeto)
  - [Requisitos](#requisitos)
  - [Instalação](#instalação)
  - [Configuração](#configuração)
    - [Banco de Dados](#banco-de-dados)
    - [Configuração Inicial](#configuração-inicial)
    - [Arquivo `config.php`](#arquivo-configphp)
  - [Uso](#uso)
    - [Login](#login)
    - [Dashboard](#dashboard)
    - [Central de Pacientes](#central-de-pacientes)
    - [Novo Atendimento](#novo-atendimento)
  - [Contribuição](#contribuição)
  - [Licença](#licença)

## Funcionalidades

- **Tela de Login:** Autenticação de operadores com acesso a configurações de banco de dados.
- **Dashboard:** Navegação central com acesso rápido a funcionalidades como "Novo Atendimento" e "Central de Pacientes".
- **Central de Pacientes:** Lista e filtra pacientes com detalhes exibidos em modal.
- **Novo Atendimento:** Formulário em abas para cadastro de novos atendimentos, incluindo convênio, dados do paciente e detalhes do atendimento.
- **Configuração Dinâmica:** Modals para configurar e salvar detalhes do banco de dados em `config.php`.
- **Integração com MySQL:** Conexão PDO para operações de banco de dados.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

complabweb/
├── assets/
│   └── microscope-logo.png
├── css/
│   └── style.css
├── js/
│   └── script.js
├── php/
│   ├── check_config_password.php
│   ├── list_databases.php
│   ├── update_config.php
│   ├── dashboard.php
│   ├── logout.php
│   └── config.php
├── index.html
├── dashboard.html
├── central-pacientes.html
├── novo-atendimento.html
└── README.md


- **`index.html`:** Tela de login.
- **`dashboard.html`:** Página principal após login.
- **`central-pacientes.html`:** Lista e detalhes de pacientes.
- **`novo-atendimento.html`:** Cadastro de novos atendimentos.
- **`css/style.css`:** Estilos compartilhados.
- **`js/script.js`:** Lógica JavaScript para modals e interações.
- **`php/`:** Scripts PHP para backend e configuração.

## Requisitos

- Servidor web com suporte a PHP (ex.: Apache, Nginx).
- MySQL para o banco de dados.
- Navegador moderno (Chrome, Firefox, etc.).

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/IsraelSilva99/complabweb.git

2. Navegue até a pasta do projeto:
    cd complabweb

3. Configure o servidor web para servir a pasta complabweb (ex.: usando XAMPP, WAMP ou Docker)

4. Acesse http://localhost/complabweb/index.html no navegador

## Configuração

### Banco de Dados
- Crie um banco de dados MySQL chamado `complab_advanced`.
- Importe o schema necessário (se houver).

### Configuração Inicial
- Acesse a tela de login e clique em "Configurações".
- Insira a senha de configuração (padrão: `admin123`).
- Preencha os detalhes do banco de dados e salve.

### Arquivo `config.php`
- Após salvar, o arquivo `php/config.php` será atualizado com os detalhes do banco.

## Uso

### Login
- Insira as credenciais de operador (autenticação ainda não implementada completamente).

### Dashboard
- Navegue pelas opções da sidebar para acessar funcionalidades.

### Central de Pacientes
- Use filtros para buscar pacientes e clique para ver detalhes.

### Novo Atendimento
- Preencha o formulário em abas e clique em "Cadastrar" (salvamento no banco ainda não implementado).

## Contribuição

Contribuições são bem-vindas! Siga estes passos:

1. Fork o repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`).
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`).
4. Push para a branch (`git push origin feature/nova-feature`).
5. Abra um Pull Request.

## Licença

Este projeto ainda não possui uma licença definida. Entre em contato com o autor para mais informações.

---

**Desenvolvido por Israel Silva** - [GitHub](https://github.com/IsraelSilva99)
