import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/*
 * DESIGN: CRICINFO (hard)
 * ========================
 *
 * WHAT IT DOES:
 *   - Track live cricket matches ball by ball
 *   - Maintain scorecards: batting, bowling stats per player
 *   - Track teams, players, tournaments
 *   - Live commentary feed
 *   - Match states: NOT_STARTED, IN_PROGRESS (1st innings, 2nd innings), COMPLETED
 *
 * NOUNS: Match, Team, Player, Innings, Over, Ball, Scorecard, Tournament, Commentary
 * VERBS: createMatch(), recordBall(), getScorecard(), getLiveScore(), addCommentary()
 *
 * PATTERNS USED:
 *   - Observer → notify subscribers on each ball update (live score)
 *   - State → match lifecycle (NOT_STARTED → TOSS → 1ST_INNINGS → 2ND_INNINGS → COMPLETED)
 *   - Strategy → different match formats (T20, ODI, Test) affect rules
 *
 * KEY DESIGN DECISIONS:
 *   1. Ball is the atomic unit — everything builds up from recording each ball
 *   2. Innings contains Overs, Over contains Balls
 *   3. Each Ball records: bowler, batsman, runs, wicket (if any), extras
 *   4. Scorecard is COMPUTED from ball data, not stored separately
 *
 * CLASSES TO BUILD:
 *   1. Player — name, role (BATSMAN, BOWLER, ALL_ROUNDER)
 *   2. Team — name, List<Player>
 *   3. Ball — bowler, batsman, runs, isWicket, wicketType, extras
 *   4. Over — overNumber, List<Ball>, bowler
 *   5. Innings — battingTeam, bowlingTeam, List<Over>, totalRuns, wickets
 *   6. Scorecard — batting stats (Map<Player, BattingStats>), bowling stats
 *   7. BattingStats — runs, balls faced, fours, sixes, isOut
 *   8. BowlingStats — overs bowled, runs conceded, wickets, maidens
 *   9. Match — team1, team2, innings[], matchFormat, state, tossWinner
 *   10. CricinfoService — createMatch(), recordBall(), getScorecard()
 *
 * API:
 *   service.createMatch(team1, team2, MatchFormat.T20)
 *   service.toss(matchId, winnerTeam, decision) // BAT or BOWL
 *   service.recordBall(matchId, bowler, batsman, runs, wicket?)
 *   service.getScorecard(matchId)
 *   service.getLiveScore(matchId)  → "India 150/3 (18.2 overs)"
 */

// Step 1: Create enums — PlayerRole, MatchFormat, MatchState, WicketType
// YOUR CODE HERE


// Step 2: Create Player, Team classes
// YOUR CODE HERE


// Step 3: Create Ball, Over, Innings classes
// YOUR CODE HERE


// Step 4: Create BattingStats, BowlingStats, Scorecard classes
// YOUR CODE HERE


// Step 5: Create Match class
// YOUR CODE HERE


// Step 6: Build CricinfoService
// YOUR CODE HERE


// Step 7: Main class to test
public class Cricinfo {
    public static void main(String[] args) {
        // TODO: Create 2 teams with 3 players each (simplified)
        // TODO: Create a T20 match
        // TODO: Record 6 balls of an over
        // TODO: Get live score
        // TODO: Get scorecard with batting and bowling stats
        System.out.println("Cricinfo - implement me!");
    }
}
