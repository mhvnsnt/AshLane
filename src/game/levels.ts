import { parseCart, type Cart } from "./model";

export const STORY_SOURCE = `@cart ashlane
@title Ashlane Circuit
@start ward
@blurb Free-roam the ward from above. Step through a door and the street drops into a belt brawl.

@room ward
@mode roam
@name Cinder Ward
@door kiln
@door kiln
@door alley
@npc Mira|Clean hits feed the coil. Three strikes, and the third one lifts them off the lane.
@npc Voss|Alley is the east door. Kiln yard is north. Step off their line and a punch goes wide.
@sign Ashlane Circuit. Strike with J. Dash with K. Coil blast with L.
##################
#####DD###########
#N...............#
#................#
#................#
#.......S........#
#................#
#.......P.......D#
#................#
#...............N#
#................#
##################

@room alley
@mode brawl
@name Scrap Alley
@door ward
##########################
#........................#
#........................#
D.....E.......E..|....E..#
#........................#
#.............H..........#
#........................#
##########################

@room kiln
@mode brawl
@name Kiln Yard
@door ward
########################
#......................#
#......................#
D..E........|.....M....#
#......................#
#..........C...........#
#......................#
########################
`;

export const BLANK_SOURCE = `@cart mix
@title Mix Lane
@start pocket
@blurb A pocket plaza stitched to one belt lane.

@room pocket
@mode roam
@name Pocket
@door lane
@npc Wren|Paint E for a grunt, M for a bruiser, and a | where the gate should hold.
##############
#N...........#
#............#
#.....P.....D#
#............#
##############

@room lane
@mode brawl
@name Lane
@door pocket
####################
#..................#
#..................#
D..E......|....E...#
#.........H........#
#..................#
####################
`;

function must(source: string): Cart {
  const parsed = parseCart(source);
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.cart;
}

export const STORY = must(STORY_SOURCE);
export const BLANK = must(BLANK_SOURCE);
