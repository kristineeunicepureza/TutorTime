import { extractBookingRows, getMyBookings, getTutorBookings } from './apiService';

describe('booking API role paths', () => {
  const token = 'header.payload.signature';

  beforeEach(() => {
    global.fetch = jest.fn();
    localStorage.setItem('authToken', token);
  });

  afterEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('requests student bookings from /bookings/student', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [{ id: 'b1', status: 'CONFIRMED' }] }),
    });

    const payload = await getMyBookings();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bookings/student',
      expect.objectContaining({ method: 'GET' })
    );
    expect(extractBookingRows(payload)).toEqual([{ id: 'b1', status: 'CONFIRMED' }]);
  });

  it('requests tutor bookings from /bookings/tutor', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [{ id: 'b2', bookingStatus: 'PENDING' }] }),
    });

    const payload = await getTutorBookings();

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/bookings/tutor',
      expect.objectContaining({ method: 'GET' })
    );
    expect(extractBookingRows(payload)).toEqual([{ id: 'b2', bookingStatus: 'PENDING' }]);
  });
});

describe('extractBookingRows payload hydration', () => {
  it('extracts rows from nested data shape', () => {
    const payload = { data: { data: [{ id: 'nested-1' }] } };
    expect(extractBookingRows(payload)).toEqual([{ id: 'nested-1' }]);
  });

  it('extracts rows from bookings field', () => {
    const payload = { bookings: [{ id: 'bookings-1' }] };
    expect(extractBookingRows(payload)).toEqual([{ id: 'bookings-1' }]);
  });
});
