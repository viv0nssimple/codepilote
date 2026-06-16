export const QUESTIONS = [
  { 
    ID: "Q-FR-0001", Public: "ETG général", Theme: "Intersections et Priorités", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/intersection_droite.png", alt: "Intersection sans signalisation", auteur: "AI Généré", licence: "Libre" },
    q: "Sur une route sans panneau à une intersection, la règle par défaut est :", 
    choices: ["Priorité à droite", "Priorité à gauche", "La route la plus large a la priorité"], correct: 0, 
    explication: "En l'absence de signalisation, c'est la règle de la priorité à droite qui s'applique.", 
    analyse_risque: "Refus de priorité causant une collision latérale.", source_juridique: "Article R415-5" 
  },
  { 
    ID: "Q-FR-0002", Public: "ETG général", Theme: "Signalisation", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/feu_orange.png", alt: "Feu orange fixe", auteur: "AI Généré", licence: "Libre" },
    q: "Le feu tricolore est orange fixe. Que dois-tu faire si tu peux t'arrêter sans risque ?", 
    choices: ["Accélérer", "Freiner et m'arrêter", "Passer prudemment"], correct: 1, 
    explication: "L'orange fixe signifie un arrêt obligatoire si les conditions de sécurité le permettent.", 
    analyse_risque: "Franchissement dangereux risquant de percuter un autre usager.", source_juridique: "Article R412-31" 
  },
  { 
    ID: "Q-FR-0003", Public: "ETG général", Theme: "Circulation et Vitesse", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/vitesse_ville.png", alt: "Panneau 50 km/h en ville", auteur: "AI Généré", licence: "Libre" },
    q: "En agglomération, quelle est la vitesse maximale autorisée par défaut ?", 
    choices: ["50 km/h", "70 km/h", "30 km/h"], correct: 0, 
    explication: "En ville, la limite est de 50 km/h sauf indication contraire (Zone 30).", 
    analyse_risque: "Vitesse excessive augmentant la distance de freinage.", source_juridique: "Article R413-3" 
  },
  { 
    ID: "Q-FR-0004", Public: "ETG général", Theme: "Intersections et Priorités", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/route_prioritaire.png", alt: "Panneau route prioritaire", auteur: "AI Généré", licence: "Libre" },
    q: "Tu roules sur une route prioritaire (panneau AB6). À l'intersection, tu dois :", 
    choices: ["T'arrêter", "Céder le passage", "Ralentir tout en gardant la priorité"], correct: 2, 
    explication: "Sur route prioritaire, tu conserves la priorité, mais la prudence reste obligatoire.", 
    analyse_risque: "Absence de vérification d'une potentielle erreur des autres conducteurs.", source_juridique: "Article R415-7" 
  },
  { 
    ID: "Q-FR-0005", Public: "ETG général", Theme: "Conducteur et Vigilance", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/ceinture_securite.png", alt: "Ceinture de sécurité", auteur: "AI Généré", licence: "Libre" },
    q: "La ceinture de sécurité est obligatoire :", 
    choices: ["Seulement à l'avant", "Seulement sur autoroute", "Pour tous les passagers à tout moment"], correct: 2, 
    explication: "Le port de la ceinture est obligatoire pour tous les occupants du véhicule.", 
    analyse_risque: "Éjection du véhicule en cas de choc.", source_juridique: "Article R412-1" 
  },
  { 
    ID: "Q-FR-0006", Public: "ETG général", Theme: "Mécanique et Sécurité", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/pneu_usure.png", alt: "Pneu usé", auteur: "AI Généré", licence: "Libre" },
    q: "Dans une voiture, la profondeur minimale légale des rainures d'un pneu est de :", 
    choices: ["1 mm", "1,6 mm", "2 mm"], correct: 1, 
    explication: "La limite légale d'usure des pneumatiques pour une voiture est fixée à 1,6 millimètre.", 
    analyse_risque: "Perte d'adhérence et aquaplaning en cas de pluie.", source_juridique: "Article R314-1" 
  },
  { 
    ID: "Q-FR-0007", Public: "ETG général", Theme: "Croisement / Dépassement", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/autoroute_camion.png", alt: "Autoroute derrière un camion", auteur: "AI Généré", licence: "Libre" },
    q: "Sur autoroute, quelle est la distance de sécurité minimale derrière un poids lourd à 80 km/h ?", 
    choices: ["50 mètres", "Environ 80 mètres (2 traits de B.A.U)", "150 mètres"], correct: 1, 
    explication: "À 80km/h, on parcourt environ 22m/s, en 2 secondes cela fait 44m, mais sur autoroute on recommande 2 traits soit 73m environ.", 
    analyse_risque: "Manque de visibilité et collision par l'arrière.", source_juridique: "Article R412-12" 
  },
  { 
    ID: "Q-FR-0008", Public: "ETG général", Theme: "Signalisation", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/rond_point.png", alt: "Rond-point", auteur: "AI Généré", licence: "Libre" },
    q: "Dans un giratoire classique (avec Cédez-le-passage à l'entrée), qui est prioritaire ?", 
    choices: ["Les véhicules entrant", "Les véhicules déjà engagés", "Celui qui vient de droite"], correct: 1, 
    explication: "Le panneau oblige ceux qui entrent à céder le passage à l'anneau.", 
    analyse_risque: "Accrochage matériel par refus d'insertion.", source_juridique: "Article R415-10" 
  },
  { 
    ID: "Q-FR-0009", Public: "ETG général", Theme: "Circulation et Vitesse", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/autoroute_pluie.png", alt: "Autoroute sous la pluie", auteur: "AI Généré", licence: "Libre" },
    q: "Par temps de pluie sur autoroute, la vitesse maximale autorisée passe de 130 km/h à :", 
    choices: ["110 km/h", "100 km/h", "90 km/h"], correct: 0, 
    explication: "Par temps de pluie, la limite est abaissée à 110 km/h sur autoroute.", 
    analyse_risque: "Aquaplaning et perte de contrôle.", source_juridique: "Article R413-2" 
  },
  { 
    ID: "Q-FR-0010", Public: "ETG général", Theme: "Conducteur et Vigilance", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/alcool_volant.png", alt: "Éthylotest", auteur: "AI Généré", licence: "Libre" },
    q: "Quel est le taux d'alcoolémie maximal autorisé pour un conducteur NOVICE ?", 
    choices: ["0,5 g/L", "0,2 g/L", "0 g/L"], correct: 1, 
    explication: "Pendant la période probatoire, le seuil est de 0,2 g/L (soit 0 verre).", 
    analyse_risque: "Altération des réflexes.", source_juridique: "Article R234-1" 
  },
  { 
    ID: "Q-FR-0011", Public: "ETG général", Theme: "Croisement / Dépassement", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/clignotant.png", alt: "Clignotant activé", auteur: "AI Généré", licence: "Libre" },
    q: "L'utilisation du clignotant pour se rabattre après un dépassement est-elle obligatoire ?", 
    choices: ["Non", "Oui", "Seulement de nuit"], correct: 1, 
    explication: "Tout changement de voie doit être signalé par les avertisseurs lumineux.", 
    analyse_risque: "Surprendre le véhicule dépassé.", source_juridique: "Article R412-10" 
  },
  { 
    ID: "Q-FR-0012", Public: "ETG général", Theme: "Usagers vulnérables", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/cycliste_feu.png", alt: "Cycliste au feu rouge", auteur: "AI Généré", licence: "Libre" },
    q: "Un cycliste peut-il franchir un feu rouge si le panneau M12 (Cédez le passage cycliste) est présent ?", 
    choices: ["Non, jamais", "Oui, si la voie est libre", "Uniquement s'il va tout droit"], correct: 1, 
    explication: "Le panonceau M12 transforme le feu rouge en cédez-le-passage pour le cycliste.", 
    analyse_risque: "Collision avec des véhicules passant au vert.", source_juridique: "Article R415-15" 
  },
  { 
    ID: "Q-FR-0013", Public: "ETG général", Theme: "Mécanique et Sécurité", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/voyant_huile.png", alt: "Voyant d'huile rouge", auteur: "AI Généré", licence: "Libre" },
    q: "Que signifie le témoin lumineux rouge représentant une burette d'huile sur le tableau de bord ?", 
    choices: ["Niveau d'huile bas", "Pression d'huile moteur insuffisante", "Il faut faire la vidange"], correct: 1, 
    explication: "Ce voyant ROUGE indique un problème grave de pression, l'arrêt immédiat est impératif.", 
    analyse_risque: "Casse moteur imminente.", source_juridique: "Annexe Technique" 
  },
  { 
    ID: "Q-FR-0014", Public: "ETG général", Theme: "Arrêt et Stationnement", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/stationnement_pieton.png", alt: "Stationnement sur passage piéton", auteur: "AI Généré", licence: "Libre" },
    q: "Quelle est l'amende encourue pour un stationnement très gênant (ex: sur passage piéton) ?", 
    choices: ["35 €", "135 €", "90 €"], correct: 1, 
    explication: "Un stationnement très gênant est passible d'une contravention de 4ème classe.", 
    analyse_risque: "Mise en danger d'usagers vulnérables contraints de contourner le véhicule.", source_juridique: "Article R417-11" 
  },
  { 
    ID: "Q-FR-0015", Public: "ETG général", Theme: "Mécanique et Sécurité", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/freinage_urgence.png", alt: "Freinage d'urgence", auteur: "AI Généré", licence: "Libre" },
    q: "Le système ABS permet de :", 
    choices: ["Réduire la distance de freinage sur verglas", "Garder le contrôle de la direction lors d'un freinage d'urgence", "Freiner plus fort automatiquement"], correct: 1, 
    explication: "L'Anti-lock Braking System (ABS) empêche les roues de se bloquer, permettant ainsi de conserver le pouvoir directionnel.", 
    analyse_risque: "Perte de contrôle et collision frontale en cas de blocage des roues.", source_juridique: "Fiche technique" 
  },
  { 
    ID: "Q-FR-0016", Public: "ETG général", Theme: "Arrêt et Stationnement", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/vitesse_ville.png", alt: "Conduite en ville", auteur: "AI Généré", licence: "Libre" },
    q: "Le stationnement en double file est :", 
    choices: ["Autorisé pour une course rapide", "Strictement interdit", "Autorisé si j'allume les feux de détresse"], correct: 1, 
    explication: "Le stationnement en double file gêne la circulation et masque la visibilité. C'est interdit.", 
    analyse_risque: "Obstruction de la voie publique et risque d'accident.", source_juridique: "Article R417-10" 
  },
  { 
    ID: "Q-FR-0017", Public: "ETG général", Theme: "Signalisation", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/route_prioritaire.png", alt: "Panneau de signalisation", auteur: "AI Généré", licence: "Libre" },
    q: "Un panneau triangulaire avec une bordure rouge indique :", 
    choices: ["Une interdiction", "Une obligation", "Un danger"], correct: 2, 
    explication: "La forme triangulaire est spécifiquement réservée aux panneaux de danger.", 
    analyse_risque: "Surprise face à un danger non anticipé.", source_juridique: "Arrêté sur la signalisation" 
  },
  { 
    ID: "Q-FR-0018", Public: "ETG général", Theme: "Croisement / Dépassement", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/autoroute_camion.png", alt: "Dépassement", auteur: "AI Généré", licence: "Libre" },
    q: "Peut-on dépasser par la droite sur l'autoroute ?", 
    choices: ["Oui, si la voie de gauche est lente", "Non, c'est strictement interdit", "Oui, en cas de fort trafic seulement"], correct: 1, 
    explication: "Le dépassement s'effectue toujours par la gauche, même sur autoroute.", 
    analyse_risque: "Collision latérale à haute vitesse.", source_juridique: "Article R412-27" 
  },
  { 
    ID: "Q-FR-0019", Public: "ETG général", Theme: "Signalisation", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/intersection_droite.png", alt: "Ligne au sol", auteur: "AI Généré", licence: "Libre" },
    q: "La ligne continue blanche sépare les voies :", 
    choices: ["Je peux la chevaucher pour dépasser un vélo", "Je ne peux ni la franchir ni la chevaucher en temps normal", "Je peux la franchir si personne n'arrive"], correct: 1, 
    explication: "Une ligne continue est un mur virtuel. Toutefois, la tolérance existe pour un vélo si la visibilité le permet.", 
    analyse_risque: "Choc frontal avec un véhicule venant en face.", source_juridique: "Article R412-19" 
  },
  { 
    ID: "Q-FR-0020", Public: "ETG général", Theme: "Conducteur et Vigilance", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/alcool_volant.png", alt: "Vigilance", auteur: "AI Généré", licence: "Libre" },
    q: "En conduisant, téléphoner avec le téléphone en main :", 
    choices: ["Est toléré à l'arrêt au feu rouge", "Est interdit et sanctionné", "Est autorisé avec un haut-parleur allumé"], correct: 1, 
    explication: "Tenir un téléphone en main en conduisant est sanctionné d'un retrait de 3 points et d'une amende.", 
    analyse_risque: "Inattention menant à un accident grave.", source_juridique: "Article R412-6-1" 
  },
  { 
    ID: "Q-FR-0021", Public: "ETG général", Theme: "Visibilité et Météo", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/vitesse_ville.png", alt: "Conduite de nuit", auteur: "AI Généré", licence: "Libre" },
    q: "La nuit, sur une route éclairée en agglomération, je roule avec :", 
    choices: ["Les feux de croisement ou de position", "Les feux de route", "Sans feux si l'éclairage est fort"], correct: 0, 
    explication: "En ville éclairée, il faut être vu sans éblouir : feux de croisement ou feux de position.", 
    analyse_risque: "Ne pas être perçu par les autres usagers.", source_juridique: "Article R416-1" 
  },
  { 
    ID: "Q-FR-0022", Public: "ETG général", Theme: "Intersections et Priorités", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/stationnement_pieton.png", alt: "Passage piéton", auteur: "AI Généré", licence: "Libre" },
    q: "Un piéton s'engage sur un passage non protégé, je dois :", 
    choices: ["Le contourner", "Klaxonner pour le presser", "M'arrêter et le laisser passer"], correct: 2, 
    explication: "Le piéton engagé ou manifestant l'intention de s'engager a toujours la priorité absolue.", 
    analyse_risque: "Renversement d'un usager vulnérable.", source_juridique: "Article R415-11" 
  },
  { 
    ID: "Q-FR-0023", Public: "ETG général", Theme: "Signalisation", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/intersection_droite.png", alt: "Signalisation intersection", auteur: "AI Généré", licence: "Libre" },
    q: "Le panneau STOP m'oblige à :", 
    choices: ["Ralentir fortement et passer si la voie est libre", "Marquer un temps d'arrêt absolu", "M'arrêter uniquement s'il y a d'autres voitures"], correct: 1, 
    explication: "Au STOP, l'arrêt total (roues immobilisées) est obligatoire dans tous les cas.", 
    analyse_risque: "Refus de priority très dangereux.", source_juridique: "Article R415-6" 
  },
  { 
    ID: "Q-FR-0024", Public: "ETG général", Theme: "Arrêt et Stationnement", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/autoroute_camion.png", alt: "Bord de route", auteur: "AI Généré", licence: "Libre" },
    q: "Sur une chaussée à double sens hors agglomération, je peux stationner :", 
    choices: ["Uniquement sur l'accotement droit", "À gauche s'il y a de la place", "Sur la chaussée si j'allume mes feux"], correct: 0, 
    explication: "On doit toujours stationner sur l'accotement droit dans le sens de la marche.", 
    analyse_risque: "Véhicule mal garé causant un obstacle dangereux.", source_juridique: "Article R417-4" 
  },
  { 
    ID: "Q-FR-0025", Public: "ETG général", Theme: "Visibilité et Météo", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/autoroute_pluie.png", alt: "Pluie forte", auteur: "AI Généré", licence: "Libre" },
    q: "Quand puis-je utiliser les feux de brouillard arrière ?", 
    choices: ["En cas de forte pluie", "En cas de brouillard ou de chute de neige", "La nuit sur route sinueuse"], correct: 1, 
    explication: "Le feu de brouillard arrière est éblouissant. Il est interdit sous la pluie, réservé au brouillard/neige.", 
    analyse_risque: "Éblouissement des conducteurs suiveurs.", source_juridique: "Article R416-7" 
  },
  { 
    ID: "Q-FR-0026", Public: "ETG général", Theme: "Conducteur et Vigilance", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/freinage_urgence.png", alt: "Temps de réaction", auteur: "AI Généré", licence: "Libre" },
    q: "Le temps de réaction moyen d'un conducteur en pleine forme est d'environ :", 
    choices: ["0,5 seconde", "1 seconde", "2 secondes"], correct: 1, 
    explication: "Le temps de réaction (perception + décision + action) est évalué à environ 1 seconde.", 
    analyse_risque: "Augmentation exponentielle de la distance d'arrêt.", source_juridique: "Données de la Sécurité Routière" 
  },
  { 
    ID: "Q-FR-0027", Public: "ETG général", Theme: "Environnement / Éconduite", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/pneu_usure.png", alt: "Consommation", auteur: "AI Généré", licence: "Libre" },
    q: "Pour réduire ma consommation de carburant, je dois :", 
    choices: ["Rouler en sur-régime", "Conduire de manière souple et anticiper les freinages", "Laisser le moteur tourner à l'arrêt court"], correct: 1, 
    explication: "L'éco-conduite consiste à lisser la vitesse et utiliser le frein moteur.", 
    analyse_risque: "Pollution inutile et usure prématurée des freins.", source_juridique: "Préconisations CEREMA" 
  },
  { 
    ID: "Q-FR-0028", Public: "ETG général", Theme: "Mécanique et Sécurité", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/voyant_huile.png", alt: "Contrôle technique", auteur: "AI Généré", licence: "Libre" },
    q: "Le contrôle technique d'une voiture neuve doit être fait :", 
    choices: ["Tous les ans", "Dans les 6 mois précédant le 4ème anniversaire", "Dès la première année"], correct: 1, 
    explication: "Le premier contrôle technique s'effectue avant les 4 ans de la mise en circulation.", 
    analyse_risque: "Rouler avec un véhicule défaillant (freins, pneus...).", source_juridique: "Article R323-22" 
  },
  { 
    ID: "Q-FR-0029", Public: "ETG général", Theme: "Administratif et Passagers", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/ceinture_securite.png", alt: "Passagers", auteur: "AI Généré", licence: "Libre" },
    q: "Puis-je transporter un enfant de moins de 10 ans à l'avant ?", 
    choices: ["Oui, si les places arrière sont occupées par d'autres enfants", "Oui, dans tous les cas", "Non, jamais"], correct: 0, 
    explication: "Autorisé si l'arrière est occupé, ou si la voiture n'a pas de siège arrière (ou si siège auto dos route).", 
    analyse_risque: "Blessure grave de l'enfant avec l'airbag frontal.", source_juridique: "Article R412-3" 
  },
  { 
    ID: "Q-FR-0030", Public: "ETG général", Theme: "Secourisme", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/freinage_urgence.png", alt: "Secours", auteur: "AI Généré", licence: "Libre" },
    q: "Quelle est la première action à réaliser si j'arrive en premier sur un accident matériel et corporel ?", 
    choices: ["Alerter les secours", "Protéger les lieux (feux de détresse, triangle)", "Sortir les victimes des véhicules"], correct: 1, 
    explication: "Règle PAS : Protéger (éviter le sur-accident), puis Alerter, puis Secourir.", 
    analyse_risque: "Création d'un sur-accident très grave (carambolage).", source_juridique: "Gestes de Premiers Secours" 
  },
  { 
    ID: "Q-FR-0031", Public: "ETG général", Theme: "Croisement / Dépassement", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/clignotant.png", alt: "Changement de direction", auteur: "AI Généré", licence: "Libre" },
    q: "Est-il permis de dépasser un véhicule qui indique son intention de tourner à gauche ?", 
    choices: ["Oui, par la droite", "Oui, par la gauche", "Non, on doit attendre"], correct: 0, 
    explication: "C'est la seule exception au dépassement : si un usager tourne à gauche, on le dépasse par la droite si l'espace est suffisant.", 
    analyse_risque: "Percuter l'usager qui tourne à gauche.", source_juridique: "Article R412-27" 
  },
  { 
    ID: "Q-FR-0032", Public: "ETG général", Theme: "Circulation et Vitesse", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/autoroute_camion.png", alt: "Contrôle radar", auteur: "AI Généré", licence: "Libre" },
    q: "Un radar automatique tourelle contrôle :", 
    choices: ["La vitesse uniquement", "Le franchissement de feu rouge uniquement", "La vitesse, le feu rouge, la ceinture et le téléphone"], correct: 2, 
    explication: "Les nouveaux radars tourelles sont homologués pour flasher de multiples infractions simultanément.", 
    analyse_risque: "Cumul de comportements dangereux non perçus.", source_juridique: "Sécurité Routière" 
  },
  { 
    ID: "Q-FR-0033", Public: "ETG général", Theme: "Administratif et Passagers", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/ceinture_securite.png", alt: "Permis de conduire", auteur: "AI Généré", licence: "Libre" },
    q: "Quelle est la durée de validité du permis B probatoire si l'on a suivi l'Apprentissage Anticipé de la Conduite (AAC) ?", 
    choices: ["3 ans", "2 ans", "1 an et demi"], correct: 1, 
    explication: "L'AAC (conduite accompagnée) réduit la période probatoire de 3 ans à 2 ans.", 
    analyse_risque: "Perte du permis par manque d'expérience.", source_juridique: "Article L223-1" 
  },
  { 
    ID: "Q-FR-0034", Public: "ETG général", Theme: "Mécanique et Sécurité", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/freinage_urgence.png", alt: "Système AFU", auteur: "AI Généré", licence: "Libre" },
    q: "Qu'est-ce que l'AFU (Aide au Freinage d'Urgence) ?", 
    choices: ["Un système qui freine tout seul en ville", "Un système qui amplifie la puissance du freinage lors d'un appui brusque sur la pédale", "Un système qui remplace l'ABS"], correct: 1, 
    explication: "L'AFU détecte un appui réflexe rapide et applique la pression maximale sur les freins.", 
    analyse_risque: "Distance d'arrêt trop longue due à une pression insuffisante du conducteur.", source_juridique: "Données constructeurs" 
  },
  { 
    ID: "Q-FR-0035", Public: "ETG général", Theme: "Usagers vulnérables", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/cycliste_feu.png", alt: "Dépasser un vélo", auteur: "AI Généré", licence: "Libre" },
    q: "Quel écart latéral minimum dois-je laisser pour dépasser un cycliste hors agglomération ?", 
    choices: ["1 mètre", "1,50 mètre", "2 mètres"], correct: 1, 
    explication: "Hors agglomération, l'écart de sécurité pour un vélo ou piéton est de 1,50m (1m en agglomération).", 
    analyse_risque: "Le souffle d'air du véhicule peut déséquilibrer le cycliste.", source_juridique: "Article R414-4" 
  },
  { 
    ID: "Q-FR-0036", Public: "ETG général", Theme: "Arrêt et Stationnement", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/stationnement_pieton.png", alt: "Stationnement handicapé", auteur: "AI Généré", licence: "Libre" },
    q: "Le stationnement sur les places pour personnes handicapées sans carte CMI est :", 
    choices: ["Autorisé le dimanche", "Strictement interdit et sanctionné de 135€", "Autorisé pour moins de 5 minutes"], correct: 1, 
    explication: "C'est un stationnement très gênant, passible de 135€ d'amende et d'enlèvement.", 
    analyse_risque: "Blocage d'une personne à mobilité réduite.", source_juridique: "Article R417-11" 
  },
  { 
    ID: "Q-FR-0037", Public: "ETG général", Theme: "Intersections et Priorités", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/intersection_droite.png", alt: "Pompier sirène", auteur: "AI Généré", licence: "Libre" },
    q: "Un véhicule de pompiers avec gyrophares bleus allumés et sirène deux-tons approche, je dois :", 
    choices: ["Accélérer pour ne pas le gêner", "Lui céder le passage et faciliter sa progression", "Garder ma priorité si j'ai un feu vert"], correct: 1, 
    explication: "C'est un Véhicule d'Intérêt Général Prioritaire (VIGP). Je dois m'écarter et le laisser passer.", 
    analyse_risque: "Retarder une intervention de secours vitale.", source_juridique: "Article R415-12" 
  },
  { 
    ID: "Q-FR-0038", Public: "ETG général", Theme: "Visibilité et Météo", Difficulté: "Débutant", Type: "Photographie", 
    Image: { src: "./assets/img/vitesse_ville.png", alt: "Conduite de nuit hors agglomération", auteur: "AI Généré", licence: "Libre" },
    q: "La nuit sur une route non éclairée, sans croiser d'autres usagers, je dois utiliser :", 
    choices: ["Mes feux de croisement", "Mes feux de route", "Mes feux antibrouillard"], correct: 1, 
    explication: "Les feux de route (pleins phares) sont obligatoires pour voir le plus loin possible, à condition de ne gêner personne.", 
    analyse_risque: "Percuter un obstacle non éclairé (animal, piéton).", source_juridique: "Article R416-1" 
  },
  { 
    ID: "Q-FR-0039", Public: "ETG général", Theme: "Secourisme", Difficulté: "Intermédiaire", Type: "Photographie", 
    Image: { src: "./assets/img/freinage_urgence.png", alt: "Accident", auteur: "AI Généré", licence: "Libre" },
    q: "Une victime d'accident est inconsciente mais respire normalement. Dans quelle position la mettre ?", 
    choices: ["Sur le dos, jambes surélevées", "Position Latérale de Sécurité (PLS)", "Assise"], correct: 1, 
    explication: "La PLS permet d'éviter l'étouffement par la langue ou les vomissements.", 
    analyse_risque: "Asphyxie de la victime.", source_juridique: "Gestes de Premiers Secours" 
  },
  { 
    ID: "Q-FR-0040", Public: "ETG général", Theme: "Signalisation", Difficulté: "Avancé", Type: "Photographie", 
    Image: { src: "./assets/img/vitesse_ville.png", alt: "Panneau conseillé", auteur: "AI Généré", licence: "Libre" },
    q: "Un panneau carré bleu avec un chiffre blanc '30' indique :", 
    choices: ["Une vitesse maximale conseillée de 30 km/h", "Une obligation de rouler à au moins 30 km/h", "Une limitation de vitesse stricte à 30 km/h"], correct: 0, 
    explication: "Le panneau carré bleu indique une indication ou un conseil. Rond bleu = obligation. Rond rouge = interdiction.", 
    analyse_risque: "Rouler trop vite dans une zone réputée difficile (virage dangereux).", source_juridique: "Arrêté sur la signalisation" 
  }
];
