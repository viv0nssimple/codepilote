import { generateSeries } from './randomizer.js';

function runTests() {
    console.log("🛠️ DÉMARRAGE DE L'AUDIT DU MOTEUR D'ALÉATOIRE (TDD)...");
    
    // Génération d'un pool massif de questions fictives (ex: 5000)
    let mockPool = [];
    for(let i=0; i<2000; i++) mockPool.push({ id: `Q-FR-D${i}`, Difficulté: 'Débutant' });
    for(let i=0; i<2000; i++) mockPool.push({ id: `Q-FR-I${i}`, Difficulté: 'Intermédiaire' });
    for(let i=0; i<1000; i++) mockPool.push({ id: `Q-FR-A${i}`, Difficulté: 'Avancé' });
    
    console.log(`📦 Pool généré: ${mockPool.length} questions (40% Deb, 40% Int, 20% Av).`);
    
    // Test 1: Tirage de 10 questions
    console.log("\n🧪 Test 1: Tirage d'une série Solo (10 questions)");
    let series10 = generateSeries([...mockPool], 10);
    
    let stats10 = { deb: 0, int: 0, av: 0 };
    series10.forEach(q => {
        if(q.Difficulté === 'Débutant') stats10.deb++;
        if(q.Difficulté === 'Intermédiaire') stats10.int++;
        if(q.Difficulté === 'Avancé') stats10.av++;
    });
    
    console.log(`Résultats: ${stats10.deb} Débutant (Attendu: 4), ${stats10.int} Intermédiaire (Attendu: 4), ${stats10.av} Avancé (Attendu: 2)`);
    if(stats10.deb === 4 && stats10.int === 4 && stats10.av === 2) console.log("✅ TEST 1 PASSED");
    else { console.error("❌ TEST 1 FAILED"); process.exit(1); }
    
    // Test 2: Tirage de 1000 questions (Stress test)
    console.log("\n🧪 Test 2: Stress test avec 1000 questions");
    let series1000 = generateSeries([...mockPool], 1000);
    
    let stats1000 = { deb: 0, int: 0, av: 0 };
    series1000.forEach(q => {
        if(q.Difficulté === 'Débutant') stats1000.deb++;
        if(q.Difficulté === 'Intermédiaire') stats1000.int++;
        if(q.Difficulté === 'Avancé') stats1000.av++;
    });
    
    console.log(`Résultats: ${stats1000.deb} Débutant (Attendu: 400), ${stats1000.int} Intermédiaire (Attendu: 400), ${stats1000.av} Avancé (Attendu: 200)`);
    if(stats1000.deb === 400 && stats1000.int === 400 && stats1000.av === 200) console.log("✅ TEST 2 PASSED");
    else { console.error("❌ TEST 2 FAILED"); process.exit(1); }
    
    console.log("\n🎉 TOUS LES TESTS SONT VALIDÉS. MOTEUR CONFORME.");
}

runTests();
