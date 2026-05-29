import { Dish } from './types';

export const DISHES: Dish[] = [
  {
    id: 'shroom-burger',
    name: 'Truffle Portobello Emperor',
    tagline: 'Smoky brioche, gold-dusted portobello, and dripping aged white cheddar',
    shortDescription: 'A premium, high-fidelity burger with a thick oak-smoked Angus patty, molten white cheddar, organic lettuce, and roasted truffle portobello crown on a gilded brioche.',
    longDescription: 'Engineered as an architectural masterpiece. The base stands on an aged brioche bun, brushed with light truffle butter, followed by hand-formed, dry-aged prime Angus beef. It is crowned with a caramelized organic portobello cap, dripping in extra-sharp English cheddar, seasoned with shaved winter black truffles and fine organic greens.',
    price: 24.00,
    category: 'Burgers',
    calories: 840,
    prepTime: '12 mins',
    rating: 4.9,
    reviewsCount: 142,
    ingredients: [
      { name: 'Aged Prime Angus Beef Patty', quantity: '200g', optional: false },
      { name: 'Shiitake-infused Roasted Portobello', quantity: '1 cap', optional: false },
      { name: 'Sharp Aged White Cheddar', quantity: '2 slices', optional: false },
      { name: 'Golden Brioche Bun', quantity: '1 unit', optional: false },
      { name: 'Shaved Black Truffle Aioli', quantity: '20ml', optional: true },
      { name: 'Crisp Butter Lettuce & Heirloom Tomato', quantity: 'Freshly cut', optional: true }
    ],
    chefTip: 'Best paired with a full-bodied Cabernet Sauvignon. Rotate the 3D model with "Exploded Layers" view enabled to see the exact structure of our stacked ingredients.',
    defaultTheme: 'warm'
  },
  {
    id: 'helix-ramen',
    name: 'Infinite Helix Shoyu Ramen',
    tagline: 'Twelve-hour Tonkotsu broth, hand-pulled noodles, and soft-cured liquid gold yolk',
    shortDescription: 'A rich, comforting, and deeply complex bowl of ramen styled with elegant ceramic, shimmering broth, tender marbled Chashu pork, and springy hand-rolled noodles.',
    longDescription: 'A masterful bowl representing decades of slow-cooking craft. The base broth is boiled for 12 hours under high pressure to extract ultra-savory collagen. Springy handmade alkaline noodles loop elegantly around a center egg—marinated in sweet mirin and soy sauce, split precisely to reveal a molten, glowing golden center. Garnished with bamboo shoots, green onion slivers, and crisp nori.',
    price: 19.50,
    category: 'Ramen & Bowls',
    calories: 720,
    prepTime: '15 mins',
    rating: 4.8,
    reviewsCount: 215,
    ingredients: [
      { name: '12-Hour Smoked Tonkotsu Broth', quantity: '350ml', optional: false },
      { name: 'Hand-Rolled Alkaline Noodles', quantity: '150g', optional: false },
      { name: 'Slow-Braised Kurobuta Chashu Pork', quantity: '2 slices', optional: false },
      { name: 'Molten Marinated Ajitama Egg', quantity: '1 egg', optional: false },
      { name: 'Fresh Scallion, Nori & Menma Bamboo', quantity: 'Garnish', optional: true }
    ],
    chefTip: 'Try the "Candlelight" setting to capture the golden, cozy glow of a authentic Tokyo alleyway ramen bar. Our noodles are designed to absorb flavor dynamically.',
    defaultTheme: 'candle'
  },
  {
    id: 'obsidian-sushi',
    name: 'Kyoto Obsidian Sushi Trio',
    tagline: 'Glaxed Otoro tuna, gold leaf garnish, and hand-molded warm vinegar rice',
    shortDescription: 'A luxury, minimalist presentation of premium Nigiri served on a rough slate plate, finished with brushed soy glaze and 24K edible gold flakes.',
    longDescription: 'Three pristine pieces of premium Nigiri: Fat-marbled Otoro Salmon, deep-ruby Akami Bluefin Tuna, and butter-soft Japanese Yellowtail (Hamachi). Each cut is sliced by hand at a precise 45-degree angle, draped over vinegared Koshihikari rice served slightly warm. Drizzled with a brush of house-brewed Nikiri sweet soy glaze and gold leaf highlights.',
    price: 32.00,
    category: 'Sushi & Raw',
    calories: 380,
    prepTime: '10 mins',
    rating: 4.97,
    reviewsCount: 98,
    ingredients: [
      { name: 'Premium Bluefin Otoro Tuna', quantity: '1 piece', optional: false },
      { name: 'Ultra-Grade Faroe Salmon Belly', quantity: '1 piece', optional: false },
      { name: 'Kyoto Yellowtail Hamachi', quantity: '1 piece', optional: false },
      { name: 'Seasoned Koshihikari Rice', quantity: '3 bite-sized pillow bases', optional: false },
      { name: 'Hand-Grated Fresh Wasabi Root', quantity: 'Touch', optional: true },
      { name: 'Shaved Pickled Ginger & Gold Leaf', quantity: 'Garnish', optional: true }
    ],
    chefTip: 'Eat each Nigiri in a single bite. Inspect the details of the rich fatty marbling in the salmon slice under "Cyberpunk" lighting to appreciate the sashimi cuts.',
    defaultTheme: 'cyberpunk'
  },
  {
    id: 'matcha-lava',
    name: 'Nebula Matcha Lava Fondant',
    tagline: 'Warm Uji Matcha exterior with an oozing rich ruby molten chocolate center',
    shortDescription: 'An organic, high-contrast visual culinary dessert. Soft green matcha sponge cake collapsing to release a steaming emerald lava stream onto white marble.',
    longDescription: 'This dessert balances bittersweet warmth with modern aesthetics. It features an outer cake shell of organic ceremonial grade Uji Matcha from Kyoto, lightly baked to maintain a fluffy sponge texture. Inside, a molten lava of premium white chocolate infused with matching matcha cream cascades beautifully onto the pristine plate upon the first cut.',
    price: 15.00,
    category: 'Premium Desserts',
    calories: 490,
    prepTime: '8 mins',
    rating: 4.88,
    reviewsCount: 84,
    ingredients: [
      { name: 'Organic Kyoto Uji Matcha powder', quantity: '15g', optional: false },
      { name: 'Callebaut Luxury White Chocolate', quantity: '50g', optional: false },
      { name: 'Free-Range Egg & Unsalted Butter', quantity: 'Base dough', optional: false },
      { name: 'Hand-Selected Raspberry Garnishes', quantity: '3 fresh berries', optional: true },
      { name: 'Edible Mint Leaves', quantity: 'Delicate accent', optional: true }
    ],
    chefTip: 'The ultimate contrast of temperatures. Switch on the "Cool" visual theme to emphasize the rich, creamy, and pristine design.',
    defaultTheme: 'cool'
  }
];
