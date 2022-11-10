# UCSB Course Auto-Picker

A Node.js script for automatically adding courses

## Usage

Clone this repository to your local directory.

```shell
git clone https://github.com/tigeryu8900/ucsb-course-auto-picker.git
```

Create a `.env` file at the root repository containing the username and password you use to log into UCSB Gold, as well
as the quarter in the format `YYYYQ` where `YYYY` is the year and `Q` is the quarter where `1` is Winter, `2` is Spring,
`3` is Summer, and `4` is Fall. Winter quarter is considered to be in the next year, so Winter 2023 comes after
Fall 2022. In this example, it is set to Winter 2023.

```dotenv
UCSBNETID=username
PASSWORD=password
QUARTER=20231
```

Run this command replacing `12345 23456 34567` with your list of enrollment codes.

```shell
npm start 12345 23456 34567
```

## Scheduling

To automatically add courses at a specific time (i.e. at the start of a registration pass), you would need to use the
`at` or `schtasks` command depending on your OS.

For Windows, use this command (`/tn` is the task name, `/sd` is the date in `mm/dd/yyyy` format, and `/st` is the time in 24-hour format):

```shell
schtasks /create /tn ucsb-course-auto-picker /tr "npm --prefix C:\path\to\repository\root start 12345 23456 34567" /sc once /sd 03/14/2022 /st 13:00
```

For macOS and Linux, use this command:

```shell
echo "npm --prefix /path/to/repository/root start 12345 23456 34567" | at 1300 mar 14
```

The date format for the `at` command is very flexible. Run `man at` for more info.
