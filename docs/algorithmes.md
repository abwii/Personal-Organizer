# Documentation des Algorithmes

## A. Calcul de la progression d'un objectif

La progression est un pourcentage simple basé sur le nombre d'étapes complétées par rapport au nombre total d'étapes.

**Formule :**
Progression = (Nombre d'étapes complétées / Nombre total d'étapes) \* 100

**Logique d'implémentation :**

1. Récupérer toutes les étapes associées à l'objectif (`goal.steps`).
2. Si le nombre total d'étapes est 0, retourner 0% (pour éviter la division par zéro).
3. Filtrer les étapes où `is_completed` est vrai.
4. Appliquer la formule et arrondir le résultat.

## B. Calcul du Streak (Série) d'une habitude quotidienne

Le streak représente le nombre de jours consécutifs où l'habitude a été réalisée, en remontant depuis aujourd'hui ou hier.

**Logique d'implémentation :**

1. **Récupération et Tri :** Récupérer les logs de l'habitude et les trier par date décroissante (du plus récent au plus ancien).
2. **Initialisation :**
   - `streak = 0`
   - `currentDate` = Date d'aujourd'hui (sans les heures, minuit pile).
3. **Itération :** Pour chaque `log` dans la liste triée :
   - Normaliser la date du log à minuit.
   - Calculer la différence en jours (`diffDays`) entre `currentDate` et la date du log.
   - **Condition de continuité :** Si `diffDays` est égal au `streak` actuel (c'est-à-dire que le log correspond au jour attendu dans la séquence) :
     - Incrémenter le `streak`.
     - Décrémenter `currentDate` d'un jour pour vérifier le jour précédent à la prochaine itération.
   - **Rupture :** Sinon, arrêter la boucle (`break`), la série est brisée.
4. Retourner la valeur finale de `streak`.

_Note importante : Un streak n'est pas brisé si l'utilisateur n'a pas encore validé l'habitude aujourd'hui, tant qu'il l'a validée hier._

## C. Calcul du Taux de Complétion

Ce calcul permet de visualiser l'assiduité sur une période donnée (ex: mois ou semaine).

**Formule pour habitude quotidienne (`frequency = 'daily'`) :**
Taux = (Nombre de logs sur la période / Nombre de jours dans la période) \* 100

**Formule pour habitude hebdomadaire (`frequency = 'weekly'`) :**

1. Calculer le nombre de semaines dans la période sélectionnée :
   Semaines = ceil(Jours dans la période / 7)
2. Calculer le total attendu :
   Total Attendu = Semaines \* Objectif Hebdomadaire (weekly_target)
3. Appliquer la formule :
   Taux = (Nombre de logs sur la période / Total Attendu) \* 100
