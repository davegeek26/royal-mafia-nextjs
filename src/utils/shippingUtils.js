// Shipping calculation utilities

// Define shipping zones and rates
const SHIPPING_ZONES = {
  LOCAL: {
    name: 'Local',
    rate: 5.00,
    description: 'Same state shipping'
  },
  REGIONAL: {
    name: 'Regional', 
    rate: 10.00,
    description: 'Neighboring states'
  },
  NATIONAL: {
    name: 'National',
    rate: 15.00,
    description: 'Rest of US'
  },
  INTERNATIONAL: {
    name: 'International',
    rate: 25.00,
    description: 'International shipping'
  }
};

// Weight-based multipliers
const WEIGHT_MULTIPLIERS = {
  LIGHT: 1.0,      // 0-1 lbs
  MEDIUM: 1.5,     // 1-3 lbs
  HEAVY: 2.0       // 3+ lbs
};

// Calculate total weight of basket
export const calculateTotalWeight = (basket) => {
  return basket.reduce((total, item) => {
    return total + (item.weight || 0.5); // Default to 0.5 lbs if no weight specified
  }, 0);
};

// Determine shipping zone based on customer state
export const getShippingZone = (customerState) => {
  const stateCode = customerState.toUpperCase().trim();
  
  // Define all valid US states
  const localStates = ['CA', 'NV', 'AZ']; // Local shipping zone
  const regionalStates = ['OR', 'WA', 'ID', 'UT', 'NM', 'TX', 'CO', 'WY', 'MT']; // Regional zone
  const nationalStates = [
    'AL', 'AK', 'AR', 'CT', 'DE', 'FL', 'GA', 'HI', 'IL', 'IN', 'IA', 'KS', 'KY', 
    'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'NE', 'NH', 'NJ', 'NY', 'NC', 
    'ND', 'OH', 'OK', 'PA', 'RI', 'SC', 'SD', 'TN', 'VT', 'VA', 'WV', 'WI'
  ]; // National zone
  
  // Check if it's a valid state code (exactly 2 characters)
  if (stateCode.length !== 2) {
    return null; // Invalid state format
  }
  
  if (localStates.includes(stateCode)) {
    return SHIPPING_ZONES.LOCAL;
  } else if (regionalStates.includes(stateCode)) {
    return SHIPPING_ZONES.REGIONAL;
  } else if (nationalStates.includes(stateCode)) {
    return SHIPPING_ZONES.NATIONAL;
  } else {
    return null; // Invalid or unsupported state
  }
};

// Calculate shipping cost based on weight and zone
export const calculateShippingCost = (basket, customerState) => {
  const totalWeight = calculateTotalWeight(basket);
  const shippingZone = getShippingZone(customerState);
  
  // Return empty shipping info if invalid state
  if (!shippingZone) {
    return {
      cost: 0,
      zone: '',
      description: '',
      weight: totalWeight,
      weightMultiplier: 0
    };
  }
  
  // Determine weight multiplier
  let weightMultiplier = WEIGHT_MULTIPLIERS.LIGHT;
  if (totalWeight > 3) {
    weightMultiplier = WEIGHT_MULTIPLIERS.HEAVY;
  } else if (totalWeight > 1) {
    weightMultiplier = WEIGHT_MULTIPLIERS.MEDIUM;
  }
  
  // Calculate final shipping cost
  const baseShippingCost = shippingZone.rate * weightMultiplier;
  
  return {
    cost: Math.round(baseShippingCost * 100) / 100, // Round to 2 decimal places
    zone: shippingZone.name,
    description: shippingZone.description,
    weight: totalWeight,
    weightMultiplier: weightMultiplier
  };
};

// Format shipping cost for display
export const formatShippingCost = (cost) => {
  if (cost === 0) {
    return 'FREE';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cost);
};
