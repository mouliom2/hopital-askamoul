# Hôpital Askamoul - Plateforme de Gestion Hospitalière Intelligente

Une solution moderne de gestion hospitalière intégrant l'intelligence artificielle pour optimiser les opérations et améliorer la qualité des soins.

## Fonctionnalités

- **Gestion des rendez-vous**
  - Calendrier interactif
  - Planification intelligente
  - Rappels automatiques

- **Assistant IA**
  - Aide à la décision
  - Analyse prédictive
  - Optimisation des ressources

- **Interface utilisateur moderne**
  - Design responsive
  - Navigation intuitive
  - Mode jour/nuit

## Technologies utilisées

### Frontend
- HTML5
- CSS3
- JavaScript
- Interface responsive

### Backend
- FastAPI (Python)
- PostgreSQL
- TensorFlow
- Scikit-learn

## Prérequis

- Python 3.8+
- Node.js 14+
- PostgreSQL 13+

## Installation

1. Cloner le repository
```bash
git clone https://github.com/votre-username/hopital-askamoul.git
cd hopital-askamoul
```

2. Installer les dépendances backend
```bash
cd backend
pip install -r requirements.txt
```

3. Installer les dépendances frontend
```bash
cd frontend
npm install
```

4. Configuration
- Copier `.env.example` vers `.env`
- Modifier les variables d'environnement selon votre configuration

5. Lancer le serveur de développement
```bash
# Backend
cd backend
uvicorn main:app --reload

# Frontend
cd frontend
npm run dev
```

## Utilisation

1. Accéder à l'application : http://localhost:3000
2. Se connecter avec les identifiants par défaut :
   - Email : admin@hopital-askamoul.fr
   - Mot de passe : admin123

## Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

Pour toute question ou suggestion, n'hésitez pas à nous contacter :
- Email : contact@hopital-askamoul.fr
- Site web : www.hopital-askamoul.fr
