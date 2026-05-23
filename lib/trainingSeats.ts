/** Normalize seat fields from training document (supports legacy `seats` only) */
export function getTrainingSeatsTotal(training: {
    seats_total?: number;
    seats?: number;
}): number {
    if (typeof training.seats_total === 'number' && training.seats_total > 0) {
        return training.seats_total;
    }
    return training.seats ?? 0;
}

export function getTrainingSeatsAvailable(training: {
    seats_available?: number;
    seats_total?: number;
    seats?: number;
}): number {
    if (typeof training.seats_available === 'number') {
        return Math.max(0, training.seats_available);
    }
    return getTrainingSeatsTotal(training);
}

export function buildSeatFieldsForSave(seatsTotal: number) {
    const total = Math.max(0, Number(seatsTotal) || 0);
    return {
        seats_total: total,
        seats_available: total,
        seats: total,
    };
}
