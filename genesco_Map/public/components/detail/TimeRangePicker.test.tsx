import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import moment from 'moment-timezone';
import { TimeRangePicker } from './DetailPanel';

const timeWindow = {
  fromMs: moment.tz('2026-10-18T12:00:00', 'Asia/Kolkata').valueOf(),
  toMs: moment.tz('2026-10-19T12:00:00', 'Asia/Kolkata').valueOf(),
};

const openPicker = (onTimeChange = jest.fn()) => {
  render(
    <TimeRangePicker
      timeWindow={timeWindow}
      timeZone="Asia/Kolkata"
      onTimeChange={onTimeChange}
    />
  );
  fireEvent.click(screen.getByRole('button'));
  return onTimeChange;
};

describe('TimeRangePicker', () => {
  it.each([
    ['Last 5 minutes', 'now-5m', 'now'],
    ['Last 15 minutes', 'now-15m', 'now'],
    ['Last 30 minutes', 'now-30m', 'now'],
    ['Last 1 hour', 'now-1h', 'now'],
    ['Last 3 hours', 'now-3h', 'now'],
    ['Last 6 hours', 'now-6h', 'now'],
    ['Last 24 hours', 'now-24h', 'now'],
    ['Last 7 days', 'now-7d', 'now'],
    ['Last 30 days', 'now-30d', 'now'],
    ['Last 90 days', 'now-90d', 'now'],
    ['Last 180 days', 'now-180d', 'now'],
    ['Last 1 year', 'now-1y', 'now'],
    ['Yesterday', 'now-1d/d', 'now-1d/d'],
    ['Today', 'now/d', 'now/d'],
  ])('selects the %s preset', (label, start, end) => {
    const onTimeChange = openPicker();

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(onTimeChange).toHaveBeenCalledWith(start, end);
    expect(screen.queryByRole('dialog', { name: 'Select date and time range' })).toBeNull();
  });

  it('applies a custom range in the selected timezone', () => {
    const onTimeChange = openPicker();
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-10-18T08:15:00' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-10-19T09:45:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onTimeChange).toHaveBeenCalledWith(
      '2026-10-18T08:15:00+05:30',
      '2026-10-19T09:45:00+05:30'
    );
  });

  it.each(['From', 'To'])('closes the native calendar after selecting %s', (label) => {
    openPicker();
    const input = screen.getByLabelText(label);
    fireEvent.focus(input);

    fireEvent.change(input, { target: { value: '2026-10-18T08:15:00' } });

    expect(input).not.toHaveFocus();
  });

  it.each([
    ['invalid input', 'not-a-date', '2026-10-19T09:45:00'],
    ['equal dates', '2026-10-19T09:45:00', '2026-10-19T09:45:00'],
    ['reversed dates', '2026-10-19T10:00:00', '2026-10-19T09:45:00'],
  ])('rejects %s without closing the picker', (_label, from, to) => {
    const onTimeChange = openPicker();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: from } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: to } });

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onTimeChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a valid range with the From time earlier than the To time.'
    );
    expect(screen.getByRole('dialog', { name: 'Select date and time range' })).toBeInTheDocument();
  });

  it('rejects a local time skipped by a daylight-saving transition', () => {
    const onTimeChange = jest.fn();
    render(
      <TimeRangePicker
        timeWindow={timeWindow}
        timeZone="America/New_York"
        onTimeChange={onTimeChange}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-03-08T02:30:00' },
    });
    fireEvent.change(screen.getByLabelText('To'), {
      target: { value: '2026-03-08T04:00:00' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(onTimeChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('sets the end date to now when Switch To Now is selected', () => {
    const onTimeChange = openPicker();
    fireEvent.change(screen.getByLabelText('From'), {
      target: { value: '2026-10-18T08:15:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Switch To Now/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));

    const [, end] = onTimeChange.mock.calls[0];
    expect(moment(end).valueOf()).toBeGreaterThan(Date.now() - 5000);
    expect(moment(end).valueOf()).toBeLessThanOrEqual(Date.now());
  });

  it('closes without applying changes when cancelled', () => {
    const onTimeChange = openPicker();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onTimeChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Select date and time range' })).toBeNull();
  });
});
