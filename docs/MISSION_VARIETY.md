# AshLane Mission Variety Design (2026-10-05)
Inspired by Urban Reign (100 missions) and Def Jam: Fight for NY (unique match types).

## Problem
All missions feel the same. All levels feel the same.

## Solution: Mission Archetypes

### 1. SURVIVE (Urban Reign-style)
- **Objective**: Survive X waves of enemies.
- **Twist**: Each wave adds a new enemy type. Health pickups between waves.
- **Example**: "Alley Ambush" — 5 waves in a dead-end alley.

### 2. ESCORT (Urban Reign)
- **Objective**: Protect an AI partner to the exit.
- **Twist**: Partner can fight but has low health. Use R2-style commands.
- **Example**: "Get Out" — escort a wounded ally through a parking garage.

### 3. WEAPON MASTER (Urban Reign)
- **Objective**: Win using only a specific weapon type.
- **Twist**: No fists. Bat, pipe, chain, etc. Weapon breaks after X hits.
- **Example**: "Pipe Down" — only pipes, warehouse level.

### 4. INFERNO (Def Jam)
- **Objective**: Win by ring-out into fire/hazard.
- **Twist**: The environment kills. Push them into the flames.
- **Example**: "Burn Pit" — construction site with burning barrels.

### 5. SUBWAY (Def Jam)
- **Objective**: Throw opponent into the train when it arrives.
- **Twist**: Timed. Train comes every 30 seconds. Position matters.
- **Example**: "Last Train" — subway platform.

### 6. DEMOLITION (Def Jam)
- **Objective**: Destroy the opponent's car with them in it.
- **Twist**: Not about HP. Smash the car.
- **Example**: "Chop Shop" — junkyard.

### 7. BOSS RUSH
- **Objective**: Beat 3 bosses back-to-back, no healing.
- **Twist**: Each boss has a unique style (like Def Jam's 5 styles).
- **Example**: "The Crew" — fight the gang leaders.

### 8. TAG CHAOS (Urban Reign multiplayer)
- **Objective**: 2v2 with AI partner.
- **Twist**: Partner commands (help, double-team, split).
- **Example**: "Backup" — you and a partner vs. two enforcers.

## Mission Flow (Def Jam Crib-style Hub)
Instead of a mission list, use a **MAP HUB**:
- City map with locations unlocked as you progress.
- Each location shows available missions.
- Between missions: visit shops (clothes, stats, moves).
- Phone messages advance story.

## Character Progression (Urban Reign)
After each mission, earn points. Spend on:
- **Head**: Defense vs. strikes
- **Upper**: Punch power
- **Lower**: Kick power, speed

## Implementation Priority
1. Mission archetype system (data-driven, not hardcoded)
2. Map hub UI
3. Partner AI commands
4. Body region damage
5. Progression system
