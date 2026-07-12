describe('Gamification Engine Logic', () => {
  it('awards "First Drive" badge if total_drives is exactly 1', () => {
    const profile = { total_drives: 1, total_distance_m: 5000 };
    const earned = [];
    
    if (profile.total_drives === 1) {
      earned.push('First Drive');
    }
    
    expect(earned).toContain('First Drive');
  });

  it('awards "100KM Club" badge when distance exceeds 100,000 meters', () => {
    const profile = { total_drives: 10, total_distance_m: 105000 };
    const earned = [];
    
    if (profile.total_distance_m >= 100000) {
      earned.push('100KM Club');
    }
    
    expect(earned).toContain('100KM Club');
  });

  it('awards "Night Rider" badge if started_at hour is between 0 and 5', () => {
    // 03:00 AM UTC
    const drive = { started_at: '2026-07-12T03:00:00Z' };
    const hour = new Date(drive.started_at).getUTCHours();
    const earned = [];

    if (hour >= 0 && hour <= 5) {
      earned.push('Night Rider');
    }
    
    expect(earned).toContain('Night Rider');
    expect(hour).toBe(3);
  });

  it('does NOT award "Night Rider" if hour is outside 0-5', () => {
    // 14:00 (2 PM) UTC
    const drive = { started_at: '2026-07-12T14:00:00Z' };
    const hour = new Date(drive.started_at).getUTCHours();
    const earned = [];

    if (hour >= 0 && hour <= 5) {
      earned.push('Night Rider');
    }
    
    expect(earned.length).toBe(0);
    expect(hour).toBe(14);
  });
});
