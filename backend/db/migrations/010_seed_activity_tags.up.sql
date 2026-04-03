INSERT INTO ActivityTag (activity_id, tag_id)
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'sensory-bin'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'tactile'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'independent-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'low-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sensory Rice Bin' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'art'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'tactile'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'messy-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Finger Painting Fun' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'outdoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'nature-based'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'outdoor-exploration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'science'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'language'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'sorting'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Nature Walk Scavenger Hunt' AND t.name = 'classification'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'tactile'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'open-ended'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Playdough Creations' AND t.name = 'hand-eye-coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'pouring'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'hand-eye-coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'concentration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'practical-life'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'water-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Water Pouring Station' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'stacking'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'building'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'hand-eye-coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'spatial-awareness'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'independent-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Stacking Blocks' AND t.name = 'no-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'outdoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'no-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'movement'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'hand-eye-coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Bubble Play' AND t.name = 'coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'music'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'DIY'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'cause-and-effect'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'recycled-materials'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Musical Shaker Bottles' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Obstacle Course' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Obstacle Course' AND t.name = 'balance'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Obstacle Course' AND t.name = 'coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Obstacle Course' AND t.name = 'movement'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Obstacle Course' AND t.name = 'low-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Obstacle Course' AND t.name = 'problem-solving'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Tummy Time with Toys' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Tummy Time with Toys' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Tummy Time with Toys' AND t.name = 'no-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Tummy Time with Toys' AND t.name = 'independent-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Tummy Time with Toys' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Tummy Time with Toys' AND t.name = 'coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'sorting'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'color-recognition'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'classification'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'matching'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'concentration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Color Sorting Activity' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'kitchen-activity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'practical-life'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'life-skills'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'math'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'sequencing'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'real-world-tasks'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Cooking: Banana Smoothie' AND t.name = 'practical-skills'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'gardening'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'outdoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'nature-based'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'practical-life'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'science'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'life-skills'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Gardening with Toddlers' AND t.name = 'outdoor-exploration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'art'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'open-ended'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'recycled-materials'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Collage Making' AND t.name = 'messy-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'music'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'movement'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'balance'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'no-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Dancing and Movement' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'sensory-bin'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'tactile'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'outdoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'open-ended'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Sand Play' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'language'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'pre-reading'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'quiet-time'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'no-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'independent-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Reading Time' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'kitchen-activity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'practical-life'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'math'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'sequencing'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'life-skills'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'real-world-tasks'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Baking Cookies Together' AND t.name = 'counting'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Threading and Lacing' AND t.name = 'threading'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Threading and Lacing' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Threading and Lacing' AND t.name = 'hand-eye-coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Threading and Lacing' AND t.name = 'concentration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Threading and Lacing' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Threading and Lacing' AND t.name = 'independent-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'science'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'STEM'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'cause-and-effect'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'messy-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'DIY'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Science Experiment: Baking Soda Volcano' AND t.name = 'problem-solving'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ball Pit Play' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ball Pit Play' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ball Pit Play' AND t.name = 'color-recognition'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ball Pit Play' AND t.name = 'sorting'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ball Pit Play' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ball Pit Play' AND t.name = 'movement'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'practical-life'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'life-skills'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'self-care'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'water-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'real-world-tasks'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'practical-skills'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Washing Dishes' AND t.name = 'concentration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'art'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'outdoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'writing'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'color-recognition'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Chalk Drawing' AND t.name = 'open-ended'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'puzzles'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'problem-solving'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'concentration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'spatial-awareness'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'critical-thinking'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'independent-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Puzzle Time' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'art'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'science'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'tactile'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'messy-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Ice Painting' AND t.name = 'cause-and-effect'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'mindfulness'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'balance'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'movement'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'quiet-time'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Yoga for Toddlers' AND t.name = 'no-prep'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'pouring'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'scooping'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'concentration'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'practical-life'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'fine-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'hand-eye-coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Pouring and Scooping with Beans' AND t.name = 'sensory-bin'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'imaginative-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'pretend-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'open-ended'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'free'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'recycled-materials'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Cardboard Box Play' AND t.name = 'gross-motor'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'science'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'STEM'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'cause-and-effect'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'critical-thinking'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'problem-solving'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'water-play'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Simple Science: Sink or Float' AND t.name = 'classification'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'music'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'creativity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'coordination'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'sensorial'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'indoors'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'group-activity'
UNION ALL
SELECT a.id, t.id FROM Activity a, Tag t WHERE a.title = 'Music and Instruments' AND t.name = 'movement'
