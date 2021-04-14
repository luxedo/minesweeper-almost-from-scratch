(() => {
  window.fb = {};
  let app;
  let db;
  window.fb.loadFirebase = () => {
    try {
      app = firebase.app();
      let features = [
        "auth",
        "database",
        "firestore",
        "functions",
        "messaging",
        "storage",
        "analytics",
        "remoteConfig",
        "performance",
      ].filter((feature) => typeof app[feature] === "function");
      // console.log(features);
    } catch (e) {
      // console.error(e);
    }
    db = firebase.firestore();
  };

  window.fb.loadHighScores = async () => {
    const scores = {
      beginner: [],
      intermediate: [],
      advanced: [],
    };
    function truncateString(str, num) {
      // https://medium.com/@DylanAttal/truncate-a-string-in-javascript-41f33171d5a8
      return str.length <= num ? str : str.slice(0, num) + "...";
    }
    for (const difficulty in scores) {
      scores[difficulty] = await db
        .collection("high-scores")
        .where("difficulty", "==", difficulty)
        .orderBy("score", "asc")
        .orderBy("timestamp", "asc")
        .limit(10)
        .get()
        .then((queryS) => queryS.docs.map((doc) => doc.data()));
    }
    return scores;
  };

  window.fb.setScore = (name, score, difficulty, timestamp) => {
    db.collection("high-scores").add({
      name: name,
      score: score,
      difficulty: difficulty,
      timestamp: timestamp,
    });
  };
})();
