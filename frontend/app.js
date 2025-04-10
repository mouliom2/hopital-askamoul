// Données de démonstration
const mockData = {
    patients: [
        { id: 'P001', name: 'Jean Dupont', service: 'Cardiologie', status: 'En consultation' },
        { id: 'P002', name: 'Marie Martin', service: 'Pédiatrie', status: 'En attente' },
        { id: 'P003', name: 'Pierre Durand', service: 'Urgences', status: 'Hospitalisé' }
    ],
    staff: [
        { id: 'S001', name: 'Dr. Sophie Laurent', role: 'Médecin', service: 'Cardiologie' },
        { id: 'S002', name: 'Marc Bernard', role: 'Infirmier', service: 'Pédiatrie' },
        { id: 'S003', name: 'Julie Petit', role: 'Administration', service: 'Accueil' }
    ],
    appointments: [
        { id: 'A001', patient: 'Jean Dupont', doctor: 'Dr. Sophie Laurent', date: '2025-04-10', time: '09:00' },
        { id: 'A002', patient: 'Marie Martin', doctor: 'Dr. Michel Roux', date: '2025-04-10', time: '10:30' }
    ],
    aiPredictions: {
        urgencyOccupation: {
            current: 85,
            trend: 'increasing',
            recommendation: 'Prévoir du personnel supplémentaire pour les prochaines 24h'
        },
        staffingNeeds: {
            current: 60,
            trend: 'stable',
            recommendation: 'Rotation normale du personnel suffisante'
        }
    },
    aiDiagnosis: {
        recentCases: [
            {
                symptoms: ['fièvre', 'toux', 'fatigue'],
                suggestion: 'Possible infection virale',
                confidence: 0.85
            }
        ]
    }
};

// Gestionnaire de navigation
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(button.dataset.section).classList.add('active');
    });
});

// Fonctions de rendu
function renderPatientRow(patient) {
    return `
        <tr>
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${patient.service}</td>
            <td>${patient.status}</td>
            <td>
                <button class="button" onclick="showAIAnalysis('${patient.id}')">Analyse IA</button>
                <button class="button">Modifier</button>
            </td>
        </tr>
    `;
}

function renderStaffRow(staff) {
    return `
        <tr>
            <td>${staff.id}</td>
            <td>${staff.name}</td>
            <td>${staff.role}</td>
            <td>${staff.service}</td>
            <td>
                <button class="button">Voir</button>
                <button class="button">Modifier</button>
            </td>
        </tr>
    `;
}

// Assistant IA
const aiAssistant = {
    modal: document.getElementById('aiAssistantModal'),
    messages: document.getElementById('chatMessages'),
    
    show() {
        this.modal.classList.add('active');
        this.addMessage('assistant', 'Bonjour, je suis l\'assistant IA de l\'Hôpital Askamoul. Comment puis-je vous aider ?');
    },
    
    hide() {
        this.modal.classList.remove('active');
    },
    
    addMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${content}
            </div>
        `;
        this.messages.appendChild(messageDiv);
        this.messages.scrollTop = this.messages.scrollHeight;
    },
    
    async processQuery(query) {
        // Simulation de traitement IA
        this.addMessage('user', query);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let response;
        if (query.toLowerCase().includes('rendez-vous')) {
            response = 'Je peux vous aider à planifier un rendez-vous. Quel service souhaitez-vous consulter ?';
        } else if (query.toLowerCase().includes('urgence')) {
            response = 'Le temps d\'attente actuel aux urgences est de 25 minutes. Voulez-vous que je vous donne plus de détails ?';
        } else {
            response = 'Je suis là pour vous aider avec la gestion des patients, les rendez-vous et l\'analyse des données médicales. Que souhaitez-vous faire ?';
        }
        
        this.addMessage('assistant', response);
    }
};

// Gestionnaire d'événements pour l'assistant IA
document.querySelector('.ai-assist-btn').addEventListener('click', () => {
    aiAssistant.show();
});

document.querySelector('.close-modal').addEventListener('click', () => {
    aiAssistant.hide();
});

document.querySelector('.chat-input button').addEventListener('click', () => {
    const input = document.querySelector('.chat-input input');
    const query = input.value.trim();
    if (query) {
        aiAssistant.processQuery(query);
        input.value = '';
    }
});

document.querySelector('.chat-input input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            aiAssistant.processQuery(query);
            e.target.value = '';
        }
    }
});

// Fonction pour l'analyse IA des patients
function showAIAnalysis(patientId) {
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    
    const aiButton = document.querySelector('[data-section="ai-analysis"]');
    aiButton.classList.add('active');
    document.getElementById('ai-analysis').classList.add('active');
    
    // Faire défiler jusqu'à la section d'analyse
    document.getElementById('ai-analysis').scrollIntoView({ behavior: 'smooth' });
}

// Gestionnaire de diagnostic IA
document.querySelector('.diagnosis-search button').addEventListener('click', async () => {
    const symptoms = document.querySelector('.diagnosis-search input').value.trim();
    if (symptoms) {
        const results = document.querySelector('.diagnosis-results');
        results.innerHTML = '<p>Analyse en cours...</p>';
        
        // Simulation d'analyse IA
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        results.innerHTML = `
            <div class="diagnosis-result">
                <h4>Suggestions de diagnostic</h4>
                <ul>
                    <li>Probabilité 85% : Infection virale</li>
                    <li>Probabilité 45% : Allergie saisonnière</li>
                </ul>
                <p class="hint">Ces suggestions sont basées sur l'IA et doivent être confirmées par un médecin.</p>
            </div>
        `;
    }
});

// Initialisation des données
document.getElementById('patients-table-body').innerHTML = 
    mockData.patients.map(patient => renderPatientRow(patient)).join('');

document.getElementById('staff-table-body').innerHTML = 
    mockData.staff.map(staff => renderStaffRow(staff)).join('');

// Gestionnaire de recherche
document.querySelector('.search-bar input').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    // Implémenter la recherche en fonction de la section active
    console.log('Recherche:', searchTerm);
});

// Gestionnaires d'événements pour les formulaires
document.querySelectorAll('.button.primary').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.textContent.toLowerCase();
        if (action.includes('rendez-vous')) {
            showAppointmentForm();
        } else if (action.includes('patient')) {
            alert('Formulaire de nouveau patient - À implémenter');
        } else if (action.includes('membre')) {
            alert('Formulaire de nouveau membre du personnel - À implémenter');
        }
    });
});

function showAppointmentForm(date, appointment) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${appointment ? 'Modifier le rendez-vous' : 'Nouveau Rendez-vous'}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="appointmentForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Patient</label>
                            <select name="patient" required>
                                <option value="">Sélectionner un patient</option>
                                ${mockData.patients.map(p => `
                                    <option value="${p.id}" ${appointment && appointment.patient === p.id ? 'selected' : ''}>${p.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Médecin</label>
                            <select name="doctor" required>
                                <option value="">Sélectionner un médecin</option>
                                ${mockData.staff.filter(s => s.role === 'Médecin').map(d => `
                                    <option value="${d.id}" ${appointment && appointment.doctor === d.id ? 'selected' : ''}>${d.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" name="date" required value="${date || new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group">
                            <label>Heure</label>
                            <select name="time" required>
                                ${Array.from({ length: 9 }, (_, i) => {
                                    const hour = 9 + i;
                                    return `
                                        <option value="${hour}:00" ${appointment && appointment.time === `${hour}:00` ? 'selected' : ''}>${hour}:00</option>
                                        <option value="${hour}:30" ${appointment && appointment.time === `${hour}:30` ? 'selected' : ''}>${hour}:30</option>
                                    `;
                                }).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Service</label>
                            <select name="service" required>
                                <option value="">Sélectionner un service</option>
                                <option value="Cardiologie" ${appointment && appointment.service === 'Cardiologie' ? 'selected' : ''}>Cardiologie</option>
                                <option value="Pédiatrie" ${appointment && appointment.service === 'Pédiatrie' ? 'selected' : ''}>Pédiatrie</option>
                                <option value="Urgences" ${appointment && appointment.service === 'Urgences' ? 'selected' : ''}>Urgences</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Motif de consultation</label>
                        <input type="text" name="reason" required placeholder="Entrez le motif de la consultation" value="${appointment ? appointment.reason : ''}">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="button" onclick="closeModal(this)">Annuler</button>
                        <button type="submit" class="button primary">${appointment ? 'Modifier le rendez-vous' : 'Créer le rendez-vous'}</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // Gestionnaire de fermeture
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });

    // Gestionnaire de soumission
    modal.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newAppointment = {
            id: appointment ? appointment.id : 'A' + (mockData.appointments.length + 1).toString().padStart(3, '0'),
            patient: formData.get('patient'),
            doctor: formData.get('doctor'),
            date: formData.get('date'),
            time: formData.get('time'),
            service: formData.get('service'),
            reason: formData.get('reason')
        };
        
        if (appointment) {
            const index = mockData.appointments.findIndex(apt => apt.id === appointment.id);
            if (index !== -1) {
                mockData.appointments[index] = newAppointment;
            }
        } else {
            mockData.appointments.push(newAppointment);
        }
        
        modal.remove();
        
        // Afficher une confirmation
        alert('Rendez-vous ' + (appointment ? 'modifié' : 'créé') + ' avec succès !');
        
        // Mettre à jour le calendrier
        updateCalendar();
    });
}

function closeModal(button) {
    button.closest('.modal').remove();
}

function updateCalendar() {
    const calendar = document.getElementById('appointments-calendar');
    if (calendar) {
        const now = new Date();
        calendar.innerHTML = generateCalendar(now.getFullYear(), now.getMonth());
    }
}

// Fonctions du calendrier
function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    let calendar = '';
    
    // En-têtes des jours
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    calendar += '<div class="calendar-header-row">';
    days.forEach(day => {
        calendar += `<div class="calendar-header-cell">${day}</div>`;
    });
    calendar += '</div>';
    
    // Corps du calendrier
    let day = 1;
    for (let i = 0; i < 6; i++) {
        calendar += '<div class="calendar-row">';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startingDay) {
                calendar += '<div class="calendar-cell empty"></div>';
            } else if (day > monthLength) {
                calendar += '<div class="calendar-cell empty"></div>';
            } else {
                const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayAppointments = mockData.appointments.filter(apt => apt.date === date);
                const hasAppointments = dayAppointments.length > 0;
                
                calendar += `
                    <div class="calendar-cell ${hasAppointments ? 'has-appointments' : ''}" 
                         data-date="${date}" onclick="showDayAppointments('${date}')">
                        <div class="date-number">${day}</div>
                        ${hasAppointments ? `
                            <div class="appointment-count">${dayAppointments.length} RDV</div>
                        ` : ''}
                    </div>
                `;
                day++;
            }
        }
        calendar += '</div>';
        if (day > monthLength) break;
    }
    
    return calendar;
}

function showDayAppointments(date) {
    const appointments = mockData.appointments.filter(apt => apt.date === date);
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Rendez-vous du ${formattedDate}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${appointments.length > 0 ? `
                    <div class="appointments-list">
                        ${appointments.map(apt => `
                            <div class="appointment-item">
                                <div class="appointment-time">${apt.time}</div>
                                <div class="appointment-details">
                                    <div class="appointment-patient">Patient: ${apt.patient}</div>
                                    <div class="appointment-doctor">Médecin: ${apt.doctor}</div>
                                    ${apt.service ? `<div class="appointment-service">Service: ${apt.service}</div>` : ''}
                                    ${apt.reason ? `<div class="appointment-reason">Motif: ${apt.reason}</div>` : ''}
                                </div>
                                <div class="appointment-actions">
                                    <button class="button" onclick="editAppointment('${apt.id}')">Modifier</button>
                                    <button class="button" onclick="cancelAppointment('${apt.id}')">Annuler</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="no-appointments">Aucun rendez-vous pour cette date</p>'}
                <div class="modal-actions">
                    <button class="button primary" onclick="showAppointmentForm('${date}')">
                        Nouveau Rendez-vous
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
}

function editAppointment(appointmentId) {
    const appointment = mockData.appointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    showAppointmentForm(appointment.date, appointment);
}

function cancelAppointment(appointmentId) {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        const index = mockData.appointments.findIndex(apt => apt.id === appointmentId);
        if (index !== -1) {
            mockData.appointments.splice(index, 1);
            updateCalendar();
            document.querySelector('.modal.active').remove();
        }
    }
}

// Initialisation du calendrier
updateCalendar();

// Gestionnaire du formulaire de contact
document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Simuler l'envoi du message
    const button = e.target.querySelector('button[type="submit"]');
    const originalText = button.textContent;
    button.textContent = 'Envoi en cours...';
    button.disabled = true;
    
    // Simuler un délai d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Afficher la confirmation
    alert('Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
    
    // Réinitialiser le formulaire
    e.target.reset();
    button.textContent = originalText;
    button.disabled = false;
});
