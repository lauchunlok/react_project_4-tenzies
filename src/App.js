import React from "react";
import Die from "./components/Die";
import { nanoid } from "nanoid"; // guarantee every object has its key
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";

function App() {
  // Create state to hold our array of numbers
  const [dice, setDice] = React.useState(allNewDice());
  // Create state to hold our game state
  const [tenzies, setTenzies] = React.useState(false);
  // Create state to hold the number of rolls
  const [rollNum, setRollNum] = React.useState(0);
  // Create state to hold and calculate the best record
  const [startTime, setStartTime] = React.useState(performance.now());

  const [bestRolls, setBestRolls] = React.useState(
    JSON.parse(localStorage.getItem("bestRolls")) || Infinity
  );
  const [bestTime, setBestTime] = React.useState(
    JSON.parse(localStorage.getItem("bestTime")) || Infinity
  );

  const [timeTook, setTimeTook] = React.useState(Infinity);
  const { width, height } = useWindowSize();

  // To calculate the time took
  React.useEffect(() => {
    /*
    It will calculate at first render
    And listen to tenzies to re-calculate if needed
    Therefore, the first render will always be the best because
    it will only take 0.0x second
    */

    // Move the checkRecord part outside of the first render
    if (tenzies) {
      setTimeTook(((performance.now() - startTime) / 1000).toFixed(2));
      // Check only when Tenzies cause rollNum start with 0
      if (rollNum < bestRolls) {
        setBestRolls(rollNum);
      }
    }

    if (timeTook < bestTime) {
      setBestTime(timeTook);
    }
  }, [tenzies]);

  // To check if the game has won and if new records is achieved
  React.useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);

    if (allHeld && allSameValue) {
      setTenzies(true);
    }
  }, [dice]);

  // To save best record to localStorage
  React.useEffect(() => {
    localStorage.setItem("bestRolls", JSON.stringify(bestRolls));
  }, [bestRolls]);

  React.useEffect(() => {
    localStorage.setItem("bestTime", JSON.stringify(bestTime));
  }, [bestTime]);

  function newDie() {
    return {
      value: Math.floor(Math.random() * 6) + 1,
      isHeld: false,
      id: nanoid(),
    };
  }

  function allNewDice() {
    const newDice = [];

    for (let i = 0; i < 10; i++) {
      newDice.push(newDie());
    }

    return newDice;
  }

  function roll() {
    if (tenzies === false) {
      setDice((prevDice) =>
        prevDice.map((die) => (die.isHeld === true ? die : newDie()))
      );
      setRollNum((prevNum) => prevNum + 1);
    } else {
      // Start a new game
      setTenzies(false);
      setDice(allNewDice());
      setRollNum(0);
      setStartTime(performance.now());
    }
  }

  function hold(id) {
    setDice((prevDice) =>
      prevDice.map((die) =>
        die.id === id ? { ...die, isHeld: !die.isHeld } : die
      )
    );
  }

  /* Render all dice using die component */
  const diceEl = dice.map((die) => (
    <Die
      value={die.value}
      isHeld={die.isHeld}
      key={die.id}
      handleClick={() => hold(die.id)}
    />
  ));

  return (
    <div className="App">
      <main>
        {tenzies && <Confetti width={width} height={height} />}
        <h1 className="title">Tenzies</h1>
        <p className="instructions">
          Roll until all dice are the same. Click each die to freeze it at its
          current value between rolls.
        </p>
        <div className="dice-container">{diceEl}</div>

        <button className="roll-btn" onClick={roll}>
          {tenzies ? "New Game" : "Roll"}
        </button>

        <div className="best-rolls">Best Rolls: {bestRolls}</div>
        <div className="best-time">Best Time: {bestTime}</div>

        <div className="num-rolls">Rolled: {rollNum} times</div>

        {/* <div>Start Time: {startTime}</div>
        <div>Time: {timeTook}</div> */}

        {tenzies ? (
          <div className="time-took">
            You took: {timeTook} seconds
            {/* You took: {Math.round((new Date() - startTime) / 1000)} seconds */}
          </div>
        ) : (
          ""
        )}
      </main>
    </div>
  );
}

export default App;
