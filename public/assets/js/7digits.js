function setDigits(value, digitContainerElement) {
  value = value <= 999 ? value : 999;
  const digit1 = digitContainerElement.getElementsByClassName("digit1")[0];
  const digit2 = digitContainerElement.getElementsByClassName("digit2")[0];
  const digit3 = digitContainerElement.getElementsByClassName("digit3")[0];
  const d1 = value < 0 ? "-" : Math.floor(value / 100);
  value = Math.abs(value);
  const d2 = Math.floor((value % 100) / 10);
  const d3 = Math.floor(value % 10);
  setDigit(d1, digit1);
  setDigit(d2, digit2);
  setDigit(d3, digit3);
}

function setDigit(value, digitElement) {
  const digitMap = {
    0: [true, true, true, true, true, true, false, false],
    1: [false, true, true, false, false, false, false, false],
    2: [true, true, false, true, true, false, true, true],
    3: [true, true, true, true, false, false, true, true],
    4: [false, true, true, false, false, true, true, true],
    5: [true, false, true, true, false, true, true, true],
    6: [true, false, true, true, true, true, true, true],
    7: [true, true, true, false, false, false, false, false],
    8: [true, true, true, true, true, true, true, true],
    9: [true, true, true, true, false, true, true, true],
    "-": [false, false, false, false, false, false, true, true],
  };
  const segmentMap = [
    "segA",
    "segB",
    "segC",
    "segD",
    "segE",
    "segF",
    "segGt",
    "segGb",
  ];
  const digitSegments = digitMap[value];
  for (let i = 0; i < segmentMap.length; i++) {
    const segment = digitElement.getElementsByClassName(segmentMap[i])[0];
    if (digitSegments[i]) segment.classList.remove("segment-off");
    else segment.classList.add("segment-off");
  }
}
