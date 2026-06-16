export function generateSeries(questionsPool, count) {
    if (!questionsPool || questionsPool.length === 0) return [];
    
    // Séparation par difficulté
    const debutants = questionsPool.filter(q => q.Difficulté === 'Débutant').sort(() => Math.random() - 0.5);
    const intermediaires = questionsPool.filter(q => q.Difficulté === 'Intermédiaire').sort(() => Math.random() - 0.5);
    const avances = questionsPool.filter(q => q.Difficulté === 'Avancé').sort(() => Math.random() - 0.5);
    
    // Calcul des quotas stricts (40% / 40% / 20%)
    const quotaDeb = Math.round(count * 0.4);
    const quotaInt = Math.round(count * 0.4);
    const quotaAv = count - quotaDeb - quotaInt;
    
    let series = [];
    
    // Fonction helper pour piocher en gérant les manques
    function pick(pool, amount) {
        const picked = pool.splice(0, amount);
        series.push(...picked);
        return amount - picked.length; // Retourne le nombre manquant
    }
    
    let missing = 0;
    missing += pick(debutants, quotaDeb);
    missing += pick(intermediaires, quotaInt);
    missing += pick(avances, quotaAv + missing); // Compensation si manque avant
    
    // S'il manque toujours des questions, on pioche dans ce qu'il reste (failsafe)
    const rest = [...debutants, ...intermediaires, ...avances].sort(() => Math.random() - 0.5);
    pick(rest, missing);
    
    return series.sort(() => Math.random() - 0.5); // Mélange final
}
