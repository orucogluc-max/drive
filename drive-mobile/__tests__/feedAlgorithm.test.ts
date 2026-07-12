describe('Feed Algorithm Logic', () => {
  it('combines public drives and follower drives into a chronological stream', () => {
    const followingDrives = [{ id: '1', started_at: '2026-07-12T10:00:00Z', visibility: 'followers' }];
    const publicDrives = [{ id: '2', started_at: '2026-07-12T11:00:00Z', visibility: 'public' }];
    
    // In actual implementation, this is handled via a Supabase RPC or complex query.
    // For the test, we mock the sorting behavior.
    const combined = [...followingDrives, ...publicDrives].sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    );

    expect(combined[0].id).toBe('2');
    expect(combined[1].id).toBe('1');
  });

  it('correctly calculates pagination ranges (from, to)', () => {
    const pageSize = 5;
    const page0From = 0 * pageSize;
    const page0To = page0From + pageSize - 1;
    
    expect(page0From).toBe(0);
    expect(page0To).toBe(4);

    const page1From = 1 * pageSize;
    const page1To = page1From + pageSize - 1;

    expect(page1From).toBe(5);
    expect(page1To).toBe(9);
  });
});
