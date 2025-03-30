// Função para exibir notificações (toast)
function showToast(message, type = 'success') {
    console.log('showToast chamado:', message, type);
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        console.error('Contêiner de toast não encontrado. Certifique-se de que o elemento #toast-container existe na página.');
        return;
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Highlight active menu item
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const menuItems = document.querySelectorAll('.sidebar ul li a');
    menuItems.forEach(item => {
        const page = item.getAttribute('data-page');
        if (page === currentPage) {
            item.classList.add('active');
        }
    });

    // Login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const operador = document.getElementById('operador').value;
            const senha = document.getElementById('senha').value;

            try {
                const response = await fetch('php/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ operador, senha })
                });
                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    window.location.href = 'dashboard.html';
                } else {
                    showToast(data.erro, 'error');
                }
            } catch (err) {
                showToast('Erro: ' + err.message, 'error');
            }
        });
    }

    // New attendance form
    const atendimentoForm = document.getElementById('cadastro-atendimento');
    if (atendimentoForm) {
        document.getElementById('data-cadastro').value = new Date().toLocaleDateString('pt-BR');

        // Carregar convênios
        fetch('php/convenios.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(response => response.json())
            .then(convenios => {
                const select = document.getElementById('convenio');
                select.innerHTML = '<option value="">Selecione o Convênio</option>';
                convenios.forEach(conv => {
                    select.innerHTML += `<option value="${conv.id}">${conv.nome}</option>`;
                });
            });

        // Carregar médicos
        fetch('php/medicos.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(response => response.json())
            .then(medicos => {
                const select = document.getElementById('medico');
                select.innerHTML = '<option value="">Selecione o Médico</option>';
                medicos.forEach(med => {
                    if (med.status === 'Ativo') {
                        select.innerHTML += `<option value="${med.id}">${med.nome} - CRM: ${med.crm}</option>`;
                    }
                });
            })
            .catch(err => {
                showToast('Erro ao carregar médicos: ' + err.message, 'error');
            });

        // Carregar exames iniciais apenas no primeiro <select>
        fetch('php/exames.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
            .then(response => response.json())
            .then(exames => {
                const select = document.querySelector('.exame-select');
                select.innerHTML = '<option value="">Selecione o Exame</option>';
                exames.forEach(ex => {
                    select.innerHTML += `<option value="${ex.id}">${ex.nome}</option>`;
                });
            });

        // Função para buscar paciente por RG ou CPF
        async function buscarPacientePorRgOuCpf(rg, cpf) {
            const params = new URLSearchParams();
            if (rg) params.append('rg', rg);
            if (cpf) params.append('cpf', cpf);

            try {
                const response = await fetch(`php/atendimento.php?${params.toString()}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const data = await response.json();

                if (response.ok) {
                    // Preencher os campos do formulário com os dados retornados
                    document.getElementById('nome').value = data.nome || '';
                    document.getElementById('data-nascimento').value = data.data_nascimento || '';
                    document.getElementById('sexo').value = data.sexo || '';
                    document.getElementById('telefone').value = data.telefone || '';
                    document.getElementById('endereco').value = data.endereco || '';
                    document.getElementById('bairro').value = data.bairro || '';
                    document.getElementById('cidade').value = data.cidade || '';
                    document.getElementById('nome-mae').value = data.nome_mae || '';
                    document.getElementById('procedencia').value = data.procedencia || '';
                } else {
                    showToast('Paciente não encontrado', 'info');
                }
            } catch (err) {
                showToast('Erro ao buscar paciente: ' + err.message, 'error');
            }
        }

        // Adicionar eventos onblur aos campos RG e CPF
        const rgInput = document.getElementById('rg');
        const cpfInput = document.getElementById('cpf');

        rgInput.addEventListener('blur', () => {
            const rg = rgInput.value.trim();
            if (rg) {
                buscarPacientePorRgOuCpf(rg, null);
            }
        });

        cpfInput.addEventListener('blur', () => {
            const cpf = cpfInput.value.trim();
            if (cpf) {
                buscarPacientePorRgOuCpf(null, cpf);
            }
        });

        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.tab).classList.add('active');
            });
        });

        window.nextTab = function (nextTabId) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            document.querySelector(`.tab-btn[data-tab="${nextTabId}"]`).classList.add('active');
            document.getElementById(nextTabId).classList.add('active');
        };

        window.addExame = function () {
            const container = document.getElementById('exames-container');
            const newSelect = document.createElement('select');
            newSelect.className = 'exame-select';
            newSelect.name = 'exames[]';
            newSelect.required = true;
            newSelect.innerHTML = '<option value="">Selecione o Exame</option>';

            fetch('php/exames.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                .then(response => response.json())
                .then(exames => {
                    exames.forEach(ex => {
                        newSelect.innerHTML += `<option value="${ex.id}">${ex.nome}</option>`;
                    });
                });

            container.appendChild(newSelect);
        };

        atendimentoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const exames = Array.from(document.querySelectorAll('.exame-select')).map(select => select.value);
            const atendimento = {
                convenio: document.getElementById('convenio').value,
                exames: exames,
                rg: document.getElementById('rg').value,
                cpf: document.getElementById('cpf').value,
                nome: document.getElementById('nome').value,
                dataNascimento: document.getElementById('data-nascimento').value,
                sexo: document.getElementById('sexo').value,
                acompanhante: document.getElementById('acompanhante').value,
                cpfAcompanhante: document.getElementById('cpf-acompanhante').value,
                dataCadastro: document.getElementById('data-cadastro').value,
                medico: document.getElementById('medico').value,
                localColeta: document.getElementById('local-coleta').value,
                localEntrega: document.getElementById('local-entrega').value,
                procedencia: document.getElementById('procedencia').value,
                nomeMae: document.getElementById('nome-mae').value,
                telefone: document.getElementById('telefone').value,
                endereco: document.getElementById('endereco').value,
                bairro: document.getElementById('bairro').value,
                cidade: document.getElementById('cidade').value
            };

            try {
                const response = await fetch('php/atendimento.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(atendimento)
                });

                const data = await response.json();
                if (response.ok) {
                    showToast(`Atendimento cadastrado com sucesso! Número do paciente: ${data.numpac || 'Não informado'}`, 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 2000);
                } else {
                    showToast('Erro: ' + (data.erro || 'Erro desconhecido'), 'error');
                }
            } catch (err) {
                console.error('Erro no cadastro de atendimento:', err);
                showToast('Erro ao cadastrar atendimento: ' + err.message, 'error');
            }
        });
    }

    // Central de Pacientes
    const patientTableBody = document.getElementById('patient-table-body');
    if (patientTableBody) {
        fetch('php/atendimento.php', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => response.json())
            .then(pacientes => {
                pacientes.forEach(paciente => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${paciente.numpac}</td>
                        <td>${paciente.nome}</td>
                        <td>${paciente.cpf}</td>
                        <td>${new Date(paciente.data_nascimento).toLocaleDateString('pt-BR')}</td>
                    `;
                    tr.addEventListener('dblclick', () => showPatientDetails(paciente.id));
                    patientTableBody.appendChild(tr);
                });
            })
            .catch(err => {
                showToast('Erro ao carregar pacientes: ' + err.message, 'error');
            });
    }

    window.showPatientDetails = function (id) {
        fetch(`php/atendimento.php?id=${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
            .then(response => response.json())
            .then(data => {
                const detailsDiv = document.getElementById('patient-details');
                if (data.erro) {
                    detailsDiv.innerHTML = `<p>${data.erro}</p>`;
                } else {
                    detailsDiv.innerHTML = `
                        <p><strong>Número do Paciente:</strong> ${data.numpac || 'Não informado'}</p>
                        <p><strong>Nome:</strong> ${data.nome || 'Não informado'}</p>
                        <p><strong>CPF:</strong> ${data.cpf || 'Não informado'}</p>
                        <p><strong>Data de Nascimento:</strong> ${data.data_nascimento ? new Date(data.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</p>
                        <p><strong>Sexo:</strong> ${data.sexo || 'Não informado'}</p>
                        <p><strong>Exames:</strong> ${data.exames && data.exames.length > 0 ? data.exames.join(', ') : 'Nenhum exame cadastrado'}</p>
                        <p><strong>Médico:</strong> ${data.medico_nome || 'Não informado'}</p>
                        <p><strong>Telefone:</strong> ${data.telefone || 'Não informado'}</p>
                        <p><strong>Endereço:</strong> ${data.endereco || 'Não informado'}, ${data.bairro || 'Não informado'}, ${data.cidade || 'Não informado'}</p>
                    `;
                }
                document.getElementById('patient-modal').style.display = 'flex';
            })
            .catch(err => {
                showToast('Erro ao carregar detalhes: ' + err.message, 'error');
            });
    };

    window.showDetalhes = function (id) {
        fetch(`php/atendimento.php?id=${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                const modal = document.getElementById('modal-detalhes');
                const modalContent = document.getElementById('modal-detalhes-content');

                if (!modal || !modalContent) {
                    console.error('Elementos do modal não encontrados. Verifique se #modal-detalhes e #modal-detalhes-content estão no HTML.');
                    showToast('Erro: Modal de detalhes não encontrado na página', 'error');
                    return;
                }

                modalContent.innerHTML = `
                    <h2>Detalhes do Atendimento</h2>
                    <p><strong>Número do Paciente:</strong> ${data.numpac || 'Não informado'}</p>
                    <p><strong>Nome:</strong> ${data.nome || 'Não informado'}</p>
                    <p><strong>Convênio:</strong> ${data.convenio_nome || 'Não informado'}</p>
                    <p><strong>Médico:</strong> ${data.medico_nome || 'Não informado'}</p>
                    <p><strong>Exames:</strong> ${data.exames && data.exames.length > 0 ? data.exames.join(', ') : 'Nenhum exame cadastrado'}</p>
                    <p><strong>Data de Cadastro:</strong> ${data.data_cadastro || 'Não informado'}</p>
                    <p><strong>RG:</strong> ${data.rg || 'Não informado'}</p>
                    <p><strong>CPF:</strong> ${data.cpf || 'Não informado'}</p>
                    <p><strong>Data de Nascimento:</strong> ${data.data_nascimento || 'Não informado'}</p>
                    <p><strong>Sexo:</strong> ${data.sexo || 'Não informado'}</p>
                    <p><strong>Acompanhante:</strong> ${data.acompanhante || 'Não informado'}</p>
                    <p><strong>CPF do Acompanhante:</strong> ${data.cpf_acompanhante || 'Não informado'}</p>
                    <p><strong>Local de Coleta:</strong> ${data.local_coleta || 'Não informado'}</p>
                    <p><strong>Local de Entrega:</strong> ${data.local_entrega || 'Não informado'}</p>
                    <p><strong>Procedência:</strong> ${data.procedencia || 'Não informado'}</p>
                    <p><strong>Nome da Mãe:</strong> ${data.nome_mae || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> ${data.telefone || 'Não informado'}</p>
                    <p><strong>Endereço:</strong> ${data.endereco || 'Não informado'}</p>
                    <p><strong>Bairro:</strong> ${data.bairro || 'Não informado'}</p>
                    <p><strong>Cidade:</strong> ${data.cidade || 'Não informado'}</p>
                `;
                modal.style.display = 'block';
            })
            .catch(err => {
                showToast('Erro ao carregar detalhes: ' + err.message, 'error');
            });
    };

    window.closeModal = function () {
        const patientModal = document.getElementById('patient-modal');
        if (patientModal) patientModal.style.display = 'none';

        const detalhesModal = document.getElementById('modal-detalhes');
        if (detalhesModal) detalhesModal.style.display = 'none';
    };

    // Configurações
    const configPage = document.querySelector('#configuracoes');
    if (configPage) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                button.classList.add('active');
                document.getElementById(button.dataset.tab).classList.add('active');
            });
        });

        // Usuários
        const usuarioForm = document.getElementById('usuario-form');
        if (usuarioForm) {
            fetch('php/usuarios.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                .then(response => response.json())
                .then(usuarios => {
                    const list = document.getElementById('usuarios-list');
                    usuarios.forEach(user => {
                        list.innerHTML += `<li>${user.operador}</li>`;
                    });
                });

            usuarioForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const operador = document.getElementById('novo-operador').value;
                const senha = document.getElementById('novo-senha').value;

                try {
                    const response = await fetch('php/usuarios.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ operador, senha })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        showToast('Usuário cadastrado com sucesso!', 'success');
                        document.getElementById('usuarios-list').innerHTML += `<li>${operador}</li>`;
                        usuarioForm.reset();
                    } else {
                        showToast('Erro: ' + data.erro, 'error');
                    }
                } catch (err) {
                    showToast('Erro: ' + err.message, 'error');
                }
            });
        }

        // Exames
        const exameForm = document.getElementById('exame-form');
        if (exameForm) {
            fetch('php/exames.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                .then(response => response.json())
                .then(exames => {
                    const list = document.getElementById('exames-list');
                    exames.forEach(ex => {
                        list.innerHTML += `<li>${ex.nome}</li>`;
                    });
                });

            exameForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nome = document.getElementById('novo-exame').value;

                try {
                    const response = await fetch('php/exames.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ nome })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        showToast('Exame cadastrado com sucesso!', 'success');
                        document.getElementById('exames-list').innerHTML += `<li>${nome}</li>`;
                        exameForm.reset();
                    } else {
                        showToast('Erro: ' + data.erro, 'error');
                    }
                } catch (err) {
                    showToast('Erro: ' + err.message, 'error');
                }
            });
        }

        // Convênios
        const convenioForm = document.getElementById('convenio-form');
        if (convenioForm) {
            fetch('php/convenios.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                .then(response => response.json())
                .then(convenios => {
                    const list = document.getElementById('convenios-list');
                    convenios.forEach(conv => {
                        list.innerHTML += `<li>${conv.nome}</li>`;
                    });
                });

            convenioForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nome = document.getElementById('novo-convenio').value;

                try {
                    const response = await fetch('php/convenios.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify({ nome })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        showToast('Convênio cadastrado com sucesso!', 'success');
                        document.getElementById('convenios-list').innerHTML += `<li>${nome}</li>`;
                        convenioForm.reset();
                    } else {
                        showToast('Erro: ' + data.erro, 'error');
                    }
                } catch (err) {
                    showToast('Erro: ' + err.message, 'error');
                }
            });
        }

        // Médicos
        const medicoForm = document.getElementById('medico-form');
        if (medicoForm) {
            fetch('php/medicos.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                .then(response => response.json())
                .then(medicos => {
                    const list = document.getElementById('medicos-list');
                    medicos.forEach(med => {
                        const li = document.createElement('li');
                        li.innerHTML = `${med.nome} - CRM: ${med.crm} ${med.especialidade ? ' (' + med.especialidade + ')' : ''} ${med.telefone ? ' - ' + med.telefone : ''} ${med.email ? ' - ' + med.email : ''}`;
                        const toggleBtn = document.createElement('button');
                        toggleBtn.textContent = med.status === 'Ativo' ? 'Desativar' : 'Ativar';
                        toggleBtn.className = `btn btn-small ${med.status === 'Ativo' ? 'btn-desativar' : 'btn-ativar'}`;
                        toggleBtn.addEventListener('click', () => toggleMedicoStatus(med.id, med.status, li, toggleBtn));
                        li.appendChild(toggleBtn);
                        list.appendChild(li);
                    });
                });

            medicoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const medico = {
                    nome: document.getElementById('novo-medico-nome').value,
                    crm: document.getElementById('novo-medico-crm').value,
                    especialidade: document.getElementById('novo-medico-especialidade').value,
                    telefone: document.getElementById('novo-medico-telefone').value,
                    email: document.getElementById('novo-medico-email').value
                };

                try {
                    const response = await fetch('php/medicos.php', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(medico)
                    });
                    const data = await response.json();
                    if (response.ok) {
                        showToast('Médico cadastrado com sucesso!', 'success');
                        const list = document.getElementById('medicos-list');
                        const li = document.createElement('li');
                        li.innerHTML = `${medico.nome} - CRM: ${medico.crm} ${medico.especialidade ? ' (' + medico.especialidade + ')' : ''} ${medico.telefone ? ' - ' + medico.telefone : ''} ${medico.email ? ' - ' + medico.email : ''}`;
                        const toggleBtn = document.createElement('button');
                        toggleBtn.textContent = 'Desativar';
                        toggleBtn.className = 'btn btn-small btn-desativar';
                        fetch('php/medicos.php', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                            .then(response => response.json())
                            .then(medicos => {
                                const newMedico = medicos.find(m => m.crm === medico.crm);
                                if (newMedico) {
                                    toggleBtn.addEventListener('click', () => toggleMedicoStatus(newMedico.id, 'Ativo', li, toggleBtn));
                                }
                            });
                        li.appendChild(toggleBtn);
                        list.appendChild(li);
                        medicoForm.reset();
                    } else {
                        showToast('Erro: ' + data.erro, 'error');
                    }
                } catch (err) {
                    showToast('Erro: ' + err.message, 'error');
                }
            });

            window.toggleMedicoStatus = function (id, currentStatus, li, button) {
                const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
                fetch('php/medicos.php', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ id, status: newStatus })
                })
                    .then(response => response.json().then(data => ({ response, data })))
                    .then(({ response, data }) => {
                        if (response.ok) {
                            button.textContent = newStatus === 'Ativo' ? 'Desativar' : 'Ativar';
                            button.className = `btn btn-small ${newStatus === 'Ativo' ? 'btn-desativar' : 'btn-ativar'}`;
                            showToast(`Médico ${newStatus === 'Ativo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
                        } else {
                            showToast('Erro: ' + data.erro, 'error');
                        }
                    })
                    .catch(err => showToast('Erro: ' + err.message, 'error'));
            };
        }
    }
});

// Função para carregar pacientes (com ou sem filtro)
async function loadPatients(searchTerm = '') {
    try {
        const url = searchTerm
            ? `php/atendimento.php?search=${encodeURIComponent(searchTerm)}`
            : 'php/atendimento.php';

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();

        const tableBody = document.getElementById('patient-table-body');
        tableBody.innerHTML = '';

        data.forEach(atendimento => {
            const row = `
                <tr>
                    <td>${atendimento.numpac}</td>
                    <td>${atendimento.nome}</td>
                    <td>${atendimento.cpf || 'Não informado'}</td>
                    <td>${formatDate(atendimento.data_nascimento)}</td>
                    <td><button onclick="showDetalhes(${atendimento.id})">Detalhes</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        showToast('Erro ao carregar pacientes', 'error');
    }
}

// Evento de busca (ao clicar no botão ou pressionar Enter)
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');

    searchButton.addEventListener('click', () => {
        loadPatients(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadPatients(searchInput.value.trim());
        }
    });

    // Carrega todos os pacientes inicialmente
    loadPatients();
});