/**
 * Core game logic for "Satu Malam Bulan Purnama"
 */

// Define roles and their properties
export const ROLES = {
  WEREWOLF: 'werewolf',
  FORTUNE_TELLER: 'fortune_teller',
  KNIGHT: 'knight',
  SHAMAN: 'shaman',
  PSYCHO: 'psycho',
  CITIZEN: 'citizen',
};

export const TEAMS = {
  MONSTER: 'monster',
  HUMAN: 'human',
  NEUTRAL: 'neutral',
};

export const ROLE_INFO = {
  [ROLES.WEREWOLF]: {
    name: 'WEREWOLF',
    team: TEAMS.MONSTER,
    emoji: '🐺',
    description: 'You walk among the villagers by day. By night, under the full moon, you hunt with your pack.',
    objective: 'Eliminate villagers until wolves equal or outnumber them.',
    nightAbility: 'Choose one villager to devour tonight.'
  },
  [ROLES.FORTUNE_TELLER]: {
    name: 'FORTUNE TELLER',
    team: TEAMS.HUMAN,
    emoji: '👁️',
    description: 'The Seer of the village. Each night you may peer into a soul and learn if they are wolf or human.',
    objective: 'Find the wolves and guide the village to vote them out.',
    nightAbility: 'Investigate a player to reveal if they are a Monster or Human.'
  },
  [ROLES.KNIGHT]: {
    name: 'KNIGHT',
    team: TEAMS.HUMAN,
    emoji: '🛡️',
    description: 'The Guardian of the village. Each night you may shield one soul from the wolves\' fangs.',
    objective: 'Protect crucial roles and help eliminate the wolves.',
    nightAbility: 'Select a player to shield from wolf attacks. You cannot shield the same player twice in a row.'
  },
  [ROLES.SHAMAN]: {
    name: 'SHAMAN',
    team: TEAMS.HUMAN,
    emoji: '💀',
    description: 'The Medium who speaks with the dead. You may learn the true role of anyone who has fallen.',
    objective: 'Identify dead roles to verify claims and find remaining threats.',
    nightAbility: 'Inspect a dead player\'s identity to reveal their true role.'
  },
  [ROLES.PSYCHO]: {
    name: 'PSYCHO',
    team: TEAMS.NEUTRAL,
    emoji: '🤡',
    description: 'A deranged villager who secretly worships the wolves. You do not know who they are, and they do not know you.',
    objective: 'Sow chaos and help the wolves win. You win if the monsters win.',
    nightAbility: 'No active night ability. Use discussion to mislead the villagers.'
  },
  [ROLES.CITIZEN]: {
    name: 'CITIZEN',
    team: TEAMS.HUMAN,
    emoji: '👤',
    description: 'An ordinary villager trying to survive the night. You have no special powers — only your voice and your vote.',
    objective: 'Discuss clues, spot contradictions, and vote out the wolves.',
    nightAbility: 'No night ability. Sleep tight and hope you survive until dawn.'
  }
};

/**
 * Distribute roles randomly based on player count
 */
export function getRoleDistribution(numPlayers, gameOptions) {
  const configuredRoles = gameOptions?.roles;
  if (configuredRoles) {
    const roles = [];
    [ROLES.WEREWOLF, ROLES.FORTUNE_TELLER, ROLES.KNIGHT, ROLES.SHAMAN, ROLES.PSYCHO, ROLES.CITIZEN].forEach((role) => {
      const count = Math.max(0, Number(configuredRoles[role]) || 0);
      for (let index = 0; index < count && roles.length < numPlayers; index += 1) {
        roles.push(role);
      }
    });

    while (roles.length < numPlayers) {
      roles.push(ROLES.CITIZEN);
    }

    return shuffleArray(roles);
  }

  const roles = [];
  
  if (numPlayers < 4) {
    // Fallback for developer testing
    roles.push(ROLES.WEREWOLF);
    roles.push(ROLES.FORTUNE_TELLER);
    if (numPlayers >= 2) roles.push(ROLES.KNIGHT);
    if (numPlayers >= 3) roles.push(ROLES.CITIZEN);
    return shuffleArray(roles);
  }
  
  // 4 Players
  if (numPlayers === 4) {
    return shuffleArray([
      ROLES.WEREWOLF,
      ROLES.FORTUNE_TELLER,
      ROLES.KNIGHT,
      ROLES.CITIZEN
    ]);
  }
  
  // 5 Players
  if (numPlayers === 5) {
    return shuffleArray([
      ROLES.WEREWOLF,
      ROLES.FORTUNE_TELLER,
      ROLES.KNIGHT,
      ROLES.PSYCHO,
      ROLES.CITIZEN
    ]);
  }
  
  // 6 Players
  if (numPlayers === 6) {
    return shuffleArray([
      ROLES.WEREWOLF,
      ROLES.FORTUNE_TELLER,
      ROLES.KNIGHT,
      ROLES.SHAMAN,
      ROLES.PSYCHO,
      ROLES.CITIZEN
    ]);
  }
  
  // 7 Players
  if (numPlayers === 7) {
    return shuffleArray([
      ROLES.WEREWOLF,
      ROLES.FORTUNE_TELLER,
      ROLES.KNIGHT,
      ROLES.SHAMAN,
      ROLES.PSYCHO,
      ROLES.CITIZEN,
      ROLES.CITIZEN
    ]);
  }

  // 8 Players
  if (numPlayers === 8) {
    return shuffleArray([
      ROLES.WEREWOLF,
      ROLES.WEREWOLF,
      ROLES.FORTUNE_TELLER,
      ROLES.KNIGHT,
      ROLES.SHAMAN,
      ROLES.PSYCHO,
      ROLES.CITIZEN,
      ROLES.CITIZEN
    ]);
  }

  // 9 Players
  if (numPlayers === 9) {
    return shuffleArray([
      ROLES.WEREWOLF,
      ROLES.WEREWOLF,
      ROLES.FORTUNE_TELLER,
      ROLES.KNIGHT,
      ROLES.SHAMAN,
      ROLES.PSYCHO,
      ROLES.CITIZEN,
      ROLES.CITIZEN,
      ROLES.CITIZEN
    ]);
  }

  // 10+ Players
  const wolvesCount = numPlayers >= 12 ? 3 : 2;
  for (let i = 0; i < wolvesCount; i++) roles.push(ROLES.WEREWOLF);
  roles.push(ROLES.FORTUNE_TELLER);
  roles.push(ROLES.KNIGHT);
  roles.push(ROLES.SHAMAN);
  roles.push(ROLES.PSYCHO);
  
  while (roles.length < numPlayers) {
    roles.push(ROLES.CITIZEN);
  }
  
  return shuffleArray(roles);
}

export function validateGameOptions(gameOptions) {
  const options = gameOptions || {};
  const minPlayers = Number(options.minPlayers) || 3;
  const maxPlayers = Number(options.maxPlayers) || 10;
  const configuredRoles = options.roles || {};
  const wolves = Number(configuredRoles[ROLES.WEREWOLF]) || 0;
  const totalConfigured = Object.values(configuredRoles)
    .reduce((total, count) => total + Math.max(0, Number(count) || 0), 0);

  if (minPlayers < 3 || maxPlayers > 15 || minPlayers > maxPlayers) {
    return 'Choose between 3 and 15 players, with a minimum no higher than the limit.';
  }
  if (wolves < 1) return 'Every game needs at least one Werewolf.';
  if (totalConfigured > minPlayers) return 'The configured role total cannot exceed the minimum player count.';
  if (wolves >= minPlayers / 2) return 'Werewolves must be fewer than half of the minimum player count.';
  return null;
}

// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Check if the game is over and return the winning team
 */
export function checkWinner(players) {
  let aliveWolves = 0;
  let aliveHumans = 0; // Citizens, Knights, Shamans, Fortune Tellers, Psychos
  
  Object.values(players).forEach(p => {
    if (!p.alive) return;
    if (p.role === ROLES.WEREWOLF) {
      aliveWolves++;
    } else {
      aliveHumans++;
    }
  });
  
  if (aliveWolves === 0) {
    return TEAMS.HUMAN; // Humans win (all wolves dead)
  }
  
  if (aliveWolves >= aliveHumans) {
    return TEAMS.MONSTER; // Monsters win (wolves equal or outnumber humans)
  }
  
  return null; // Game continues
}

/**
 * Resolve all night actions and return the new state
 */
export function resolveNightPhase(players) {
  const updatedPlayers = JSON.parse(JSON.stringify(players));
  
  // 1. Gather actions
  const werewolfVotes = {}; // targetPlayerId -> count
  const knightShields = {}; // targetPlayerId -> true
  
  Object.values(players).forEach(p => {
    if (!p.alive) return;
    
    if (p.role === ROLES.WEREWOLF && p.actionTarget) {
      const target = players[p.actionTarget];
      if (target?.alive && target.role !== ROLES.WEREWOLF) {
        werewolfVotes[p.actionTarget] = (werewolfVotes[p.actionTarget] || 0) + 1;
      }
    }
    
    if (p.role === ROLES.KNIGHT && p.actionTarget) {
      knightShields[p.actionTarget] = true;
      // Record this protection as the last protected player
      updatedPlayers[p.id].lastProtectedId = p.actionTarget;
    }
  });
  
  // Determine werewolf target (most voted, resolve ties randomly)
  let victimId = null;
  let maxVotes = 0;
  const potentialVictims = [];
  
  Object.entries(werewolfVotes).forEach(([targetId, votes]) => {
    if (votes > maxVotes) {
      maxVotes = votes;
      potentialVictims.length = 0;
      potentialVictims.push(targetId);
    } else if (votes === maxVotes) {
      potentialVictims.push(targetId);
    }
  });
  
  if (potentialVictims.length > 0) {
    victimId = potentialVictims[Math.floor(Math.random() * potentialVictims.length)];
  }
  
  // 2. Apply actions
  let killedPlayerId = null;
  let protectedByKnight = false;
  
  if (victimId) {
    if (knightShields[victimId]) {
      protectedByKnight = true;
    } else {
      updatedPlayers[victimId].alive = false;
      killedPlayerId = victimId;
    }
  }
  
  // Reset daily actions for all players
  Object.keys(updatedPlayers).forEach(id => {
    updatedPlayers[id].actionTarget = null;
    updatedPlayers[id].vote = null;
  });
  
  // 3. Generate atmospheric village story
  let story = '';
  let killedPlayerName = killedPlayerId ? updatedPlayers[killedPlayerId].name : '';
  
  if (killedPlayerId) {
    const stories = [
      `Dawn breaks over the village. In the forest clearing, the villagers find the torn remains of ${killedPlayerName}. The wolves fed well last night.`,
      `Morning mist lifts from the cottages. ${killedPlayerName} never returned from the woods — only claw marks and blood lead back to the village square.`,
      `A howl faded before sunrise. At the well, the body of ${killedPlayerName} is discovered. The full moon claimed another soul.`,
      `Cocks crow, but one cottage stays silent. ${killedPlayerName} was dragged into the night. The hunt was successful.`
    ];
    story = stories[Math.floor(Math.random() * stories.length)];
  } else if (victimId && protectedByKnight) {
    const stories = [
      `Dawn arrives. Paw prints circle a cottage door, but the Guardian held the line. No one died last night.`,
      `The wolves struck — and met steel. A brave defender turned the fangs aside. The village wakes intact.`,
      `Scratches score a wooden shutter, yet the occupant lives. Someone kept watch through the darkest hour.`,
      `A struggle echoed near the treeline, then silence. The Guardian's shield held. Everyone survived.`
    ];
    story = stories[Math.floor(Math.random() * stories.length)];
  } else {
    // No werewolf target selected
    const stories = [
      `Dawn arrives quietly. The forest held its breath, and every villager answers the morning roll call.`,
      `A restless night under the full moon — yet no blood was spilled. The village gathers in uneasy relief.`,
      `Morning light filters through the pines. Somehow, everyone made it through the night.`
    ];
    story = stories[Math.floor(Math.random() * stories.length)];
  }
  
  // Check for random clue addition to the story
  const clues = [
    "Wolf tracks circle the old oak near the square.",
    "A tuft of grey fur clings to a cottage fence.",
    "Blood stains the path to the woods — but not from any known victim.",
    "Whispers speak of a broken window facing the forest."
  ];
  if (Math.random() > 0.5) {
    story += ` In addition, ${clues[Math.floor(Math.random() * clues.length)]}`;
  }

  return {
    updatedPlayers,
    story,
    killedPlayerId
  };
}

/**
 * Resolve the voting phase and return results
 */
export function resolveVotingPhase(players) {
  const votes = {}; // votedPlayerId -> count
  let skipVotes = 0;
  
  // Gather active players
  Object.values(players).forEach(p => {
    if (!p.alive) return;
    if (p.vote === 'skip') {
      skipVotes++;
    } else if (p.vote) {
      votes[p.vote] = (votes[p.vote] || 0) + 1;
    }
  });
  
  // Find highest voted
  let eliminatedPlayerId = null;
  let maxVotes = 0;
  let isTie = false;
  const voteDetails = [];
  
  Object.entries(votes).forEach(([votedId, count]) => {
    voteDetails.push({ playerId: votedId, count });
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedPlayerId = votedId;
      isTie = false;
    } else if (count === maxVotes) {
      isTie = true;
    }
  });
  
  // Check if skip won or if there is a tie
  let announcedText = '';
  const updatedPlayers = JSON.parse(JSON.stringify(players));
  
  const requiredMajority = Math.floor(Object.values(players).filter(p => p.alive && !p.disconnected).length / 2) + 1;
  if (skipVotes >= requiredMajority) {
    eliminatedPlayerId = null;
    announcedText = `The village chose mercy. No one was cast out today. The council adjourns under the fading moon.`;
  } else if (isTie && maxVotes > 0) {
    eliminatedPlayerId = null;
    announcedText = `The vote ended in a tie (highest: ${maxVotes}). The villagers could not agree — no one was banished today.`;
  } else if (maxVotes < requiredMajority) {
    eliminatedPlayerId = null;
    announcedText = `No one received the required majority (${requiredMajority} votes). The council dissolves without a verdict.`;
  } else {
    // We have a single highest voted player
    const eliminatedPlayerName = updatedPlayers[eliminatedPlayerId].name;
    const eliminatedPlayerRole = updatedPlayers[eliminatedPlayerId].role;
    const roleEmoji = ROLE_INFO[eliminatedPlayerRole]?.emoji || '';
    const roleName = ROLE_INFO[eliminatedPlayerRole]?.name || '';
    
    updatedPlayers[eliminatedPlayerId].alive = false;
    announcedText = `By the will of the village, ${eliminatedPlayerName} was banished into the forest. Their true nature is revealed: ${roleEmoji} ${roleName}.`;
  }
  
  // Reset votes
  Object.keys(updatedPlayers).forEach(id => {
    updatedPlayers[id].vote = null;
    updatedPlayers[id].actionTarget = null;
  });
  
  return {
    updatedPlayers,
    eliminatedPlayerId,
    announcedText,
    voteDetails: {
      votes,
      skipVotes
    }
  };
}
