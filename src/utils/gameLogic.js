/**
 * Core game logic for "Nightmare Prison"
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
    description: 'You are a monster in disguise. Every night, you coordinate with other monsters to attack a prisoner. Blend in during the day.',
    objective: 'Eliminate all humans until monsters outnumber or equal them.',
    nightAbility: 'Choose one player to eliminate with your claw pack.'
  },
  [ROLES.FORTUNE_TELLER]: {
    name: 'FORTUNE TELLER',
    team: TEAMS.HUMAN,
    emoji: '👁️',
    description: 'You possess a mysterious sixth sense. You can peer into other prisoners\' backgrounds to see if they are a monster.',
    objective: 'Find the monsters and guide the prisoners to vote them out.',
    nightAbility: 'Investigate a player to reveal if they are a Monster or Human.'
  },
  [ROLES.KNIGHT]: {
    name: 'KNIGHT',
    team: TEAMS.HUMAN,
    emoji: '🛡️',
    description: 'You are an ex-guard who still wants to protect the innocent. You can shield a prisoner from attacks each night.',
    objective: 'Protect crucial roles and eliminate the monsters.',
    nightAbility: 'Select a player to shield from monster attacks. You cannot shield the same player twice in a row.'
  },
  [ROLES.SHAMAN]: {
    name: 'SHAMAN',
    team: TEAMS.HUMAN,
    emoji: '💀',
    description: 'You can speak with the spirits of the deceased. You can find out the exact role of any player who has died.',
    objective: 'Identify dead roles to verify claims and find remaining threats.',
    nightAbility: 'Inspect a dead player\'s identity to reveal their true role.'
  },
  [ROLES.PSYCHO]: {
    name: 'PSYCHO',
    team: TEAMS.NEUTRAL,
    emoji: '🤡',
    description: 'You are a deranged prisoner who worships the monsters. You do not know who the werewolves are, and they do not know you.',
    objective: 'Cause chaos and help the monsters win. You win if the monsters win.',
    nightAbility: 'No active night ability. Use discussion to mislead the prisoners.'
  },
  [ROLES.CITIZEN]: {
    name: 'CITIZEN',
    team: TEAMS.HUMAN,
    emoji: '👤',
    description: 'You are an ordinary prisoner trying to survive. You have no special powers but hold the power of the vote.',
    objective: 'Discuss clues, spot contradictions, and vote out the monsters.',
    nightAbility: 'No night ability. Sleep tight and hope you survive.'
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
export function resolveNightPhase(players, roomId) {
  const updatedPlayers = JSON.parse(JSON.stringify(players));
  
  // 1. Gather actions
  const werewolfVotes = {}; // targetPlayerId -> count
  const knightShields = {}; // targetPlayerId -> true
  
  Object.values(players).forEach(p => {
    if (!p.alive) return;
    
    if (p.role === ROLES.WEREWOLF && p.actionTarget) {
      werewolfVotes[p.actionTarget] = (werewolfVotes[p.actionTarget] || 0) + 1;
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
  
  // 3. Generate atmospheric story
  let story = '';
  let killedPlayerName = killedPlayerId ? updatedPlayers[killedPlayerId].name : '';
  
  if (killedPlayerId) {
    const stories = [
      `Morning has arrived. A prisoner was found cold and unresponsive in their cell. Deep claw marks cover the steel walls. ${killedPlayerName} is dead.`,
      `Daylight breaks over the iron bars. A gruesome discovery was made in the prison laundry room: ${killedPlayerName} was torn apart by a beast.`,
      `Morning light reveals a cell block covered in blood. The guards confirm that ${killedPlayerName} has vanished, leaving only a shredded, blood-stained jumpsuit.`,
      `A piercing scream woke the west block at 3 AM. At roll call, ${killedPlayerName}'s cell was empty, covered in deep scratches.`
    ];
    story = stories[Math.floor(Math.random() * stories.length)];
  } else if (victimId && protectedByKnight) {
    const stories = [
      `Morning has arrived. Strange footprints and scratches were found outside a cell door, but the lock held and the occupant is safe. No one died last night.`,
      `An alarm sounded near the prison courtyard. Security footage shows a dark shadow attacking a cell, but they were repelled by a brave defender. Everyone survived.`,
      `A lucky escape. Claw marks were found on a cell wall, but the guard patrol arrived just in time. No casualties.`,
      `A prisoner reported hearing a struggle in the dark, but a guard shield blocked the attacker. Everyone made it to the morning.`
    ];
    story = stories[Math.floor(Math.random() * stories.length)];
  } else {
    // No werewolf target selected
    const stories = [
      `Morning has arrived. A quiet and uneasy night inside the cells. All prisoners are present for roll call.`,
      `Morning roll call completes. The prison was surprisingly silent last night, though the tension is thick.`,
      `Daylight arrives without incident. But the shadows seem to linger in the corners of the cell block.`
    ];
    story = stories[Math.floor(Math.random() * stories.length)];
  }
  
  // Check for random clue addition to the story
  const clues = [
    "Strange wolf-like footprints were discovered near the sewage pipes.",
    "A guard found a piece of grey fur snagged on the cell door latch.",
    "Blood stains were found in the corridor, but they don't belong to any victim.",
    "Whispers are circulating about an open air vent leading from the boiler room."
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
  let totalVoters = 0;
  
  // Gather active players
  Object.values(players).forEach(p => {
    if (!p.alive) return;
    totalVoters++;
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
  
  if (skipVotes > maxVotes) {
    eliminatedPlayerId = null;
    announcedText = `The prisoners have voted to skip elimination today. No one was thrown into solitary confinement.`;
  } else if (isTie && maxVotes > 0) {
    eliminatedPlayerId = null;
    announcedText = `The vote ended in a tie (highest vote count: ${maxVotes}). The prisoners couldn't reach a consensus, so no one was eliminated today.`;
  } else if (maxVotes === 0) {
    eliminatedPlayerId = null;
    announcedText = `No one voted. The day ends quietly without any eliminations.`;
  } else {
    // We have a single highest voted player
    const eliminatedPlayerName = updatedPlayers[eliminatedPlayerId].name;
    const eliminatedPlayerRole = updatedPlayers[eliminatedPlayerId].role;
    const roleEmoji = ROLE_INFO[eliminatedPlayerRole]?.emoji || '';
    const roleName = ROLE_INFO[eliminatedPlayerRole]?.name || '';
    
    updatedPlayers[eliminatedPlayerId].alive = false;
    announcedText = `By majority vote, ${eliminatedPlayerName} was dragged away by the guards and thrown into solitary confinement. Their cell was searched, revealing they were the: ${roleEmoji} ${roleName}.`;
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
