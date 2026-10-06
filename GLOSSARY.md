# Rides dashboard

A small dashboard of ride counts per city, built from daily records.

## Language

**City**:
A place whose rides are counted separately (currently Boston, Denver and Miami).

**Daily ride count**:
The number of rides in one City on one date; one row of the ride data.
_Avoid_: Ride record, entry

**Month**:
A calendar month identified by its year and month (e.g. July 2026), taken directly from the date with no time-zone conversion.

**Monthly total**:
The sum of a City's Daily ride counts over one Month, with no adjustment for the number of days in the Month.
_Avoid_: Monthly rides, month sum

**Missing month**:
A Month in the data for which a City has no Daily ride counts; it is unknown, not zero.
