
export interface Reward {
  id: string;
  title: string;
  description: string;
  memberId: string;
}

export const rewardsService = {
  getRewards: (memberId: string): Reward[] => {
    const key = `rewards_${memberId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Default rewards for new members
    return [
      {
        id: '1',
        title: 'Extra TV Time',
        description: '30 minutes of extra screen time',
        memberId
      },
      {
        id: '2',
        title: 'Ice Cream Trip',
        description: 'Visit to the ice cream shop',
        memberId
      },
      {
        id: '3',
        title: 'Game Time',
        description: '1 hour of video games',
        memberId
      }
    ];
  },

  removeReward: (memberId: string, rewardId: string): void => {
    const rewards = rewardsService.getRewards(memberId);
    const updatedRewards = rewards.filter(reward => reward.id !== rewardId);
    const key = `rewards_${memberId}`;
    localStorage.setItem(key, JSON.stringify(updatedRewards));
  }
};
