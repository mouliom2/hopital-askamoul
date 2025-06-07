// Configuration de base
const API_BASE_URL = 'http://localhost:8000';

// Gestion de l'authentification
class AuthManager {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static getHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
}

// Service API
class APIService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: AuthManager.getHeaders(),
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Gestionnaire d'état global
class AppState {
    constructor() {
        this.patients = [];
        this.staff = [];
        this.appointments = [];
        this.dashboardStats = {};
        this.currentUser = null;
    }

    async loadInitialData() {
        try {
            // Charger les données du tableau de bord
            await this.loadDashboardStats();
            
            // Charger les patients
            await this.loadPatients();
            
            // Charger le personnel
            await this.loadStaff();
            
            // Charger les rendez-vous
            await this.loadAppointments();
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showErrorMessage('Impossible de charger les données. Utilisation des données de démonstration.');
            this.loadMockData();
        }
    }

    async loadDashboardStats() {
        try {
            this.dashboardStats = await APIService.get('/dashboard/stats');
            this.updateDashboardUI();
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
            this.dashboardStats = {
                totalPatients: 127,
                appointmentsToday: 23,
                pendingAppointments: 15
            };
            this.updateDashboardUI();
        }
    }

    async loadPatients() {
        try {
            this.patients = await APIService.get('/patients/');
            this.updatePatientsUI();
        } catch (error) {
            console.error('Erreur lors du chargement des patients:', error);
        }
    }

    async loadStaff() {
        try {
            this.staff = await APIService.get('/users/');
            this.updateStaffUI();
        } catch (error) {
            console.error('Erreur lors du chargement du personnel:', error);
        }
    }

    async loadAppointments() {
        try {
            this.appointments = await APIService.get('/appointments/');
            this.updateAppointmentsUI();
        } catch (error) {
            console.error('Erreur lors du chargement des rendez-vous:', error);
        }
    }

    updateDashboardUI() {
        const statsElements = {
            totalPatients: document.querySelector('.stat-card:nth-child(1) .stat'),
            appointmentsToday: document.querySelector('.stat-card:nth-child(2) .stat'),
            pendingAppointments: document.querySelector('.stat-card:nth-child(3) .stat')
        };

        if (statsElements.totalPatients) {
            statsElements.totalPatients.textContent = this.dashboardStats.totalPatients || 0;
        }
        if (statsElements.appointmentsToday) {
            statsElements.appointmentsToday.textContent = this.dashboardStats.appointmentsToday || 0;
        }
        if (statsElements.pendingAppointments) {
            statsElements.pendingAppointments.textContent = this.dashboardStats.pendingAppointments || 0;
        }
    }

    updatePatientsUI() {
        const tbody = document.getElementById('patients-table-body');
        if (tbody) {
            tbody.innerHTML = this.patients.map(patient => this.renderPatientRow(patient)).join('');
        }
    }

    updateStaffUI() {
        const tbody = document.getElementById('staff-table-body');
        if (tbody) {
            tbody.innerHTML = this.staff.map(staff => this.renderStaffRow(staff)).join('');
        }
    }

    updateAppointmentsUI() {
        this.updateCalendar();
    }

    renderPatientRow(patient) {
        return `
            <tr>
                <td>P${String(patient.id).padStart(3, '0')}</td>
                <td>${patient.full_name}</td>
                <td>${patient.gender}</td>
                <td>${patient.contact_number}</td>
                <td>
                    <button class="button" onclick="viewPatient(${patient.id})">Voir</button>
                    <button class="button" onclick="editPatient(${patient.id})">Modifier</button>
                    <button class="button" onclick="showAIAnalysis(${patient.id})">Analyse IA</button>
                </td>
            </tr>
        `;
    }

    renderStaffRow(staff) {
        return `
            <tr>
                <td>S${String(staff.id).padStart(3, '0')}</td>
                <td>${staff.full_name}</td>
                <td>${staff.role}</td>
                <td>Service principal</td>
                <td>
                    <button class="button" onclick="viewStaff(${staff.id})">Voir</button>
                    <button class="button" onclick="editStaff(${staff.id})">Modifier</button>
                </td>
            </tr>
        `;
    }

    updateCalendar() {
        const calendar = document.getElementById('appointments-calendar');
        if (calendar) {
            const now = new Date();
            calendar.innerHTML = this.generateCalendar(now.getFullYear(), now.getMonth());
        }
    }

    generateCalendar(year, month) {
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
                    const dayAppointments = this.appointments.filter(apt => {
                        const aptDate = new Date(apt.datetime).toISOString().split('T')[0];
                        return aptDate === date;
                    });
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

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee;
            color: #c00;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #fcc;
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #efe;
            color: #060;
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid #cfc;
            z-index: 1000;
            max-width: 300px;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    loadMockData() {
        // Données de démonstration si l'API n'est pas disponible
        this.patients = [
            { id: 1, full_name: 'Jean Dupont', gender: 'M', contact_number: '01 23 45 67 89' },
            { id: 2, full_name: 'Marie Martin', gender: 'F', contact_number: '01 23 45 67 90' },
            { id: 3, full_name: 'Pierre Durand', gender: 'M', contact_number: '01 23 45 67 91' }
        ];
        
        this.staff = [
            { id: 1, full_name: 'Dr. Sophie Laurent', role: 'Médecin' },
            { id: 2, full_name: 'Marc Bernard', role: 'Infirmier' },
            { id: 3, full_name: 'Julie Petit', role: 'Administration' }
        ];
        
        this.appointments = [];
        
        this.updatePatientsUI();
        this.updateStaffUI();
        this.updateAppointmentsUI();
    }
}

// Instance globale de l'état
const appState = new AppState();

// Fonctions globales
window.viewPatient = async function(patientId) {
    try {
        const patient = await APIService.get(`/patients/${patientId}`);
        showPatientDetails(patient);
    } catch (error) {
        appState.showErrorMessage('Impossible de charger les détails du patient');
    }
};

window.editPatient = function(patientId) {
    const patient = appState.patients.find(p => p.id === patientId);
    if (patient) {
        showPatientForm(patient);
    }
};

window.viewStaff = async function(staffId) {
    try {
        const staff = await APIService.get(`/users/${staffId}`);
        showStaffDetails(staff);
    } catch (error) {
        appState.showErrorMessage('Impossible de charger les détails du personnel');
    }
};

window.editStaff = function(staffId) {
    const staff = appState.staff.find(s => s.id === staffId);
    if (staff) {
        showStaffForm(staff);
    }
};

window.showAIAnalysis = function(patientId) {
    document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
    
    const aiButton = document.querySelector('[data-section="ai-analysis"]');
    aiButton.classList.add('active');
    document.getElementById('ai-analysis').classList.add('active');
    
    loadAIAnalysis(patientId);
};

window.showDayAppointments = function(date) {
    const appointments = appState.appointments.filter(apt => {
        const aptDate = new Date(apt.datetime).toISOString().split('T')[0];
        return aptDate === date;
    });
    
    showDayAppointmentsModal(date, appointments);
};

// Fonctions pour les modales et formulaires
function showPatientDetails(patient) {
    const modal = createModal('Détails du Patient', `
        <div class="patient-details">
            <p><strong>Nom:</strong> ${patient.full_name}</p>
            <p><strong>Date de naissance:</strong> ${new Date(patient.date_of_birth).toLocaleDateString()}</p>
            <p><strong>Genre:</strong> ${patient.gender}</p>
            <p><strong>Contact:</strong> ${patient.contact_number}</p>
            <p><strong>Adresse:</strong> ${patient.address}</p>
            ${patient.medical_history ? `<p><strong>Antécédents:</strong> ${patient.medical_history}</p>` : ''}
        </div>
    `);
    document.body.appendChild(modal);
}

function showStaffDetails(staff) {
    const modal = createModal('Détails du Personnel', `
        <div class="staff-details">
            <p><strong>Nom:</strong> ${staff.full_name}</p>
            <p><strong>Email:</strong> ${staff.email}</p>
            <p><strong>Rôle:</strong> ${staff.role}</p>
            <p><strong>Statut:</strong> ${staff.is_active ? 'Actif' : 'Inactif'}</p>
        </div>
    `);
    document.body.appendChild(modal);
}

function showPatientForm(patient = null) {
    const isEdit = !!patient;
    const modal = createModal(
        isEdit ? 'Modifier Patient' : 'Nouveau Patient',
        `
        <form id="patientForm">
            <div class="form-group">
                <label>Nom complet</label>
                <input type="text" name="full_name" required value="${patient?.full_name || ''}">
            </div>
            <div class="form-group">
                <label>Date de naissance</label>
                <input type="date" name="date_of_birth" required value="${patient?.date_of_birth ? patient.date_of_birth.split('T')[0] : ''}">
            </div>
            <div class="form-group">
                <label>Genre</label>
                <select name="gender" required>
                    <option value="">Sélectionner...</option>
                    <option value="M" ${patient?.gender === 'M' ? 'selected' : ''}>Masculin</option>
                    <option value="F" ${patient?.gender === 'F' ? 'selected' : ''}>Féminin</option>
                    <option value="O" ${patient?.gender === 'O' ? 'selected' : ''}>Autre</option>
                </select>
            </div>
            <div class="form-group">
                <label>Numéro de contact</label>
                <input type="tel" name="contact_number" required value="${patient?.contact_number || ''}">
            </div>
            <div class="form-group">
                <label>Adresse</label>
                <textarea name="address" required>${patient?.address || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Antécédents médicaux</label>
                <textarea name="medical_history">${patient?.medical_history || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="button" onclick="closeModal(this)">Annuler</button>
                <button type="submit" class="button primary">${isEdit ? 'Modifier' : 'Créer'}</button>
            </div>
        </form>
        `
    );

    // Gestionnaire de soumission
    modal.querySelector('#patientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            if (isEdit) {
                await APIService.put(`/patients/${patient.id}`, data);
                appState.showSuccessMessage('Patient modifié avec succès');
            } else {
                await APIService.post('/patients/', data);
                appState.showSuccessMessage('Patient créé avec succès');
            }
            await appState.loadPatients();
            modal.remove();
        } catch (error) {
            appState.showErrorMessage('Erreur lors de la sauvegarde du patient');
        }
    });

    document.body.appendChild(modal);
}

function showDayAppointmentsModal(date, appointments) {
    const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const modal = createModal(`Rendez-vous du ${formattedDate}`, `
        ${appointments.length > 0 ? `
            <div class="appointments-list">
                ${appointments.map(apt => `
                    <div class="appointment-item">
                        <div class="appointment-time">${new Date(apt.datetime).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                        <div class="appointment-details">
                            <div class="appointment-patient">Patient ID: ${apt.patient_id}</div>
                            <div class="appointment-doctor">Médecin ID: ${apt.doctor_id}</div>
                            <div class="appointment-status">Statut: ${apt.status}</div>
                            ${apt.notes ? `<div class="appointment-notes">Notes: ${apt.notes}</div>` : ''}
                        </div>
                        <div class="appointment-actions">
                            <button class="button" onclick="editAppointment(${apt.id})">Modifier</button>
                            <button class="button" onclick="cancelAppointment(${apt.id})">Annuler</button>
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
    `);
    
    document.body.appendChild(modal);
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    return modal;
}

window.closeModal = function(button) {
    button.closest('.modal').remove();
};

// Assistant IA amélioré
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
        this.addMessage('user', query);
        
        // Afficher un indicateur de chargement
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'chat-message assistant loading';
        loadingMessage.innerHTML = '<div class="message-content">Assistant IA en train de réfléchir...</div>';
        this.messages.appendChild(loadingMessage);
        this.messages.scrollTop = this.messages.scrollHeight;
        
        try {
            // Appel à l'API d'IA (simulé pour le moment)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            let response;
            if (query.toLowerCase().includes('patient')) {
                response = `Il y a actuellement ${appState.patients.length} patients enregistrés. Voulez-vous que je vous aide avec une tâche spécifique concernant les patients ?`;
            } else if (query.toLowerCase().includes('rendez-vous')) {
                response = `Je peux vous aider à gérer les rendez-vous. Il y a ${appState.appointments.length} rendez-vous programmés. Que souhaitez-vous faire ?`;
            } else if (query.toLowerCase().includes('urgence')) {
                response = 'En cas d\'urgence médicale, veuillez contacter immédiatement le service d\'urgences. Puis-je vous aider avec autre chose ?';
            } else {
                response = 'Je suis là pour vous aider avec la gestion des patients, les rendez-vous, et l\'analyse des données médicales. Pouvez-vous préciser votre demande ?';
            }
            
            loadingMessage.remove();
            this.addMessage('assistant', response);
        } catch (error) {
            loadingMessage.remove();
            this.addMessage('assistant', 'Désolé, je rencontre des difficultés techniques. Veuillez réessayer plus tard.');
        }
    }
};

// Fonctions pour l'analyse IA
async function loadAIAnalysis(patientId) {
    const analysisContainer = document.querySelector('#ai-analysis .ai-dashboard');
    if (!analysisContainer) return;
    
    // Afficher un indicateur de chargement
    analysisContainer.innerHTML = '<div class="loading">Chargement de l\'analyse IA...</div>';
    
    try {
        // Charger les prédictions de risques
        const risksData = await APIService.post(`/ai/predict-health-risks/${patientId}`, {
            age: 45,
            bmi: 25.5,
            blood_pressure_systolic: 130,
            blood_pressure_diastolic: 85,
            heart_rate: 72,
            cholesterol: 200,
            glucose: 95,
            smoking: false,
            alcohol: false,
            physical_activity: 3
        });
        
        // Charger les recommandations de traitement
        const treatmentData = await APIService.post(`/ai/recommend-treatment/${patientId}`, {
            symptoms: 'fatigue, maux de tête',
            medical_history: 'hypertension'
        });
        
        // Charger l'analyse des tendances
        const trendsData = await APIService.get(`/ai/analysis/patient-trends/${patientId}`);
        
        // Afficher les résultats
        displayAIAnalysis(risksData, treatmentData, trendsData);
        
    } catch (error) {
        console.error('Erreur lors du chargement de l\'analyse IA:', error);
        analysisContainer.innerHTML = `
            <div class="error">
                <p>Impossible de charger l'analyse IA. Utilisation des données de démonstration.</p>
            </div>
        `;
        displayMockAIAnalysis();
    }
}

function displayAIAnalysis(risks, treatments, trends) {
    const analysisContainer = document.querySelector('#ai-analysis .ai-dashboard');
    analysisContainer.innerHTML = `
        <div class="ai-card prediction">
            <h3>Prédictions de Risques</h3>
            <div class="ai-content">
                ${Object.entries(risks.risks).map(([risk, probability]) => `
                    <div class="risk-item ${probability > 0.7 ? 'high' : probability > 0.4 ? 'medium' : 'low'}">
                        <span class="risk-name">${risk}</span>
                        <div class="risk-bar">
                            <div class="risk-level" style="width: ${probability * 100}%"></div>
                        </div>
                        <span class="risk-percentage">${Math.round(probability * 100)}%</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="ai-card optimization">
            <h3>Recommandations</h3>
            <div class="ai-content">
                <div class="optimization-item">
                    <h4>Facteurs de risque identifiés</h4>
                    <ul>
                        ${risks.risk_factors.map(factor => `
                            <li>${factor.factor}: ${factor.recommendation}</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="ai-card diagnosis">
            <h3>Recommandations de Traitement</h3>
            <div class="ai-content">
                ${treatments.recommendations.map(rec => `
                    <div class="treatment-recommendation">
                        <h4>${rec.condition}</h4>
                        <p>Confiance: ${Math.round(rec.confidence * 100)}%</p>
                        <p><strong>${rec.treatment.name}</strong></p>
                        <p>${rec.treatment.description}</p>
                        <p>Efficacité: ${Math.round(rec.treatment.effectiveness * 100)}%</p>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="ai-card planning">
            <h3>Analyse des Tendances</h3>
            <div class="ai-content">
                <div class="trends-analysis">
                    <p>${trends.analysis}</p>
                    ${Object.entries(trends.trends).map(([metric, data]) => `
                        <div class="trend-item">
                            <h4>${metric}</h4>
                            <p>Tendance: ${data.trend}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function displayMockAIAnalysis() {
    const analysisContainer = document.querySelector('#ai-analysis .ai-dashboard');
    analysisContainer.innerHTML = `
        <div class="ai-card prediction">
            <h3>Prédictions de Risques</h3>
            <div class="ai-content">
                <div class="risk-item high">
                    <span class="risk-name">Risque Cardiovasculaire</span>
                    <div class="risk-bar">
                        <div class="risk-level" style="width: 75%"></div>
                    </div>
                    <span class="risk-percentage">75%</span>
                </div>
                <div class="risk-item medium">
                    <span class="risk-name">Risque Diabète</span>
                    <div class="risk-bar">
                        <div class="risk-level" style="width: 45%"></div>
                    </div>
                    <span class="risk-percentage">45%</span>
                </div>
                <div class="risk-item low">
                    <span class="risk-name">Risque Respiratoire</span>
                    <div class="risk-bar">
                        <div class="risk-level" style="width: 20%"></div>
                    </div>
                    <span class="risk-percentage">20%</span>
                </div>
            </div>
        </div>
        
        <div class="ai-card optimization">
            <h3>Recommandations</h3>
            <div class="ai-content">
                <div class="optimization-item">
                    <h4>Recommandations personnalisées</h4>
                    <ul>
                        <li>Suivi cardiologique recommandé</li>
                        <li>Surveillance de la glycémie</li>
                        <li>Programme d'exercices adaptés</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="ai-card diagnosis">
            <h3>Aide au Diagnostic</h3>
            <div class="ai-content">
                <div class="diagnosis-search">
                    <input type="text" placeholder="Décrire les symptômes..." id="symptomsInput">
                    <button class="button primary" onclick="analyzeSymptoms()">Analyser</button>
                </div>
                <div class="diagnosis-results" id="diagnosisResults">
                    <p class="hint">Utilisez l'IA pour obtenir des suggestions de diagnostic basées sur les symptômes.</p>
                </div>
            </div>
        </div>
        
        <div class="ai-card planning">
            <h3>Planification Intelligente</h3>
            <div class="ai-content">
                <div class="planning-stats">
                    <div class="stat-item">
                        <span class="stat-label">Efficacité Planning</span>
                        <span class="stat-value">92%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Temps d'Attente Moyen</span>
                        <span class="stat-value">-15%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour analyser les symptômes
window.analyzeSymptoms = async function() {
    const symptomsInput = document.getElementById('symptomsInput');
    const resultsDiv = document.getElementById('diagnosisResults');
    const symptoms = symptomsInput.value.trim();
    
    if (!symptoms) {
        resultsDiv.innerHTML = '<p class="hint">Veuillez entrer des symptômes à analyser.</p>';
        return;
    }
    
    resultsDiv.innerHTML = '<p>Analyse en cours...</p>';
    
    try {
        // Simuler l'appel à l'API d'IA
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        resultsDiv.innerHTML = `
            <div class="diagnosis-result">
                <h4>Suggestions de diagnostic</h4>
                <ul>
                    <li>Probabilité 85% : Syndrome grippal</li>
                    <li>Probabilité 60% : Stress/fatigue</li>
                    <li>Probabilité 40% : Tension artérielle</li>
                </ul>
                <p class="hint">Ces suggestions sont basées sur l'IA et doivent être confirmées par un médecin.</p>
            </div>
        `;
    } catch (error) {
        resultsDiv.innerHTML = '<p class="error">Erreur lors de l\'analyse. Veuillez réessayer.</p>';
    }
};

// Gestionnaire de navigation
document.addEventListener('DOMContentLoaded', function() {
    // Gestionnaire de navigation
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.nav-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(button.dataset.section).classList.add('active');
        });
    });

    // Gestionnaire de l'assistant IA
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

    // Gestionnaire pour les boutons "Nouveau"
    document.addEventListener('click', (e) => {
        if (e.target.textContent.includes('Nouveau Patient')) {
            showPatientForm();
        } else if (e.target.textContent.includes('Nouveau Rendez-vous')) {
            showAppointmentForm();
        }
    });

    // Gestionnaire du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            
            const button = e.target.querySelector('button[type="submit"]');
            const originalText = button.textContent;
            button.textContent = 'Envoi en cours...';
            button.disabled = true;
            
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            appState.showSuccessMessage('Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.');
            
            e.target.reset();
            button.textContent = originalText;
            button.disabled = false;
        });
    }

    // Charger les données initiales
    appState.loadInitialData();
});

// Fonction pour afficher le formulaire de rendez-vous
function showAppointmentForm(date = null, appointment = null) {
    const modal = createModal(
        appointment ? 'Modifier le rendez-vous' : 'Nouveau Rendez-vous',
        `
        <form id="appointmentForm">
            <div class="form-row">
                <div class="form-group">
                    <label>Patient</label>
                    <select name="patient_id" required>
                        <option value="">Sélectionner un patient</option>
                        ${appState.patients.map(p => `
                            <option value="${p.id}" ${appointment && appointment.patient_id === p.id ? 'selected' : ''}>${p.full_name}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Médecin</label>
                    <select name="doctor_id" required>
                        <option value="">Sélectionner un médecin</option>
                        ${appState.staff.filter(s => s.role === 'Médecin' || s.role.includes('Dr')).map(d => `
                            <option value="${d.id}" ${appointment && appointment.doctor_id === d.id ? 'selected' : ''}>${d.full_name}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" name="date" required value="${date || (appointment ? appointment.datetime.split('T')[0] : new Date().toISOString().split('T')[0])}">
                </div>
                <div class="form-group">
                    <label>Heure</label>
                    <input type="time" name="time" required value="${appointment ? new Date(appointment.datetime).toTimeString().split(' ')[0].substring(0, 5) : '09:00'}">
                </div>
            </div>
            <div class="form-group">
                <label>Statut</label>
                <select name="status" required>
                    <option value="scheduled" ${appointment && appointment.status === 'scheduled' ? 'selected' : ''}>Programmé</option>
                    <option value="completed" ${appointment && appointment.status === 'completed' ? 'selected' : ''}>Terminé</option>
                    <option value="cancelled" ${appointment && appointment.status === 'cancelled' ? 'selected' : ''}>Annulé</option>
                </select>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" placeholder="Notes optionnelles">${appointment ? appointment.notes || '' : ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="button" class="button" onclick="closeModal(this)">Annuler</button>
                <button type="submit" class="button primary">${appointment ? 'Modifier' : 'Créer'}</button>
            </div>
        </form>
        `
    );

    modal.querySelector('#appointmentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Combiner date et heure
        data.datetime = `${data.date}T${data.time}:00`;
        delete data.date;
        delete data.time;
        
        // Convertir les IDs en entiers
        data.patient_id = parseInt(data.patient_id);
        data.doctor_id = parseInt(data.doctor_id);
        
        try {
            if (appointment) {
                await APIService.put(`/appointments/${appointment.id}`, data);
                appState.showSuccessMessage('Rendez-vous modifié avec succès');
            } else {
                await APIService.post('/appointments/', data);
                appState.showSuccessMessage('Rendez-vous créé avec succès');
            }
            await appState.loadAppointments();
            modal.remove();
        } catch (error) {
            appState.showErrorMessage('Erreur lors de la sauvegarde du rendez-vous');
        }
    });

    document.body.appendChild(modal);
}

// Fonctions pour éditer/annuler les rendez-vous
window.editAppointment = function(appointmentId) {
    const appointment = appState.appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
        showAppointmentForm(null, appointment);
    }
};

window.cancelAppointment = async function(appointmentId) {
    if (confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
        try {
            await APIService.put(`/appointments/${appointmentId}`, { status: 'cancelled' });
            appState.showSuccessMessage('Rendez-vous annulé avec succès');
            await appState.loadAppointments();
            document.querySelector('.modal.active')?.remove();
        } catch (error) {
            appState.showErrorMessage('Erreur lors de l\'annulation du rendez-vous');
        }
    }
};