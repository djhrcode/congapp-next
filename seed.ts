/**
 * ! Executing this script will delete all data in your database and seed it with 10 users.
 * ! Make sure to adjust the script to your needs.
 * Use any TypeScript runner to run this script, for example: `npx tsx seed.ts`
 * Learn more about the Seed Client by following our guide: https://docs.snaplet.dev/seed/getting-started
 */
import { copycat } from '@snaplet/copycat';
import { createSeedClient } from '@snaplet/seed';
import { randomUUID } from 'node:crypto';
import {
  existsSync,
  rmSync,
  writeFile,
  writeFileSync,
  writeSync
} from 'node:fs';
import {
  sub,
  add,
  differenceInMonths,
  differenceInYears,
  min,
  isAfter,
  getMonth,
  getYear
} from 'date-fns';
import { join } from 'node:path';

function int(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const main = async () => {
  const seed = await createSeedClient();

  const nowDate = new Date();

  let inactiveCount = 0;
  let eldersCount = 0;
  let servantsCount = 0;
  let regularPioneerCount = 0;
  let auxiliarPioneerCount = 0;

  const maxInactives = 8;
  const maxElders = 8;
  const maxServants = 10;
  const maxRegularPioneers = 25;
  const maxAuxiliarPioneers = 15;

  // Truncate all tables in the database
  await seed.$resetDatabase();

  const authorId = randomUUID();

  const author = await seed.persons([
    {
      id: authorId,
      first_name: 'Daniel Josué',
      last_name: 'Hernández Romero',
      email_address: 'djhrcode@gmail.com'
    }
  ]);

  let groupId: number = 0;

  await seed.departments([
    { name: 'audio_n_video' },
    { name: 'attendants' },
    { name: 'territories' },
    { name: 'accountings' },
    { name: 'cleaning' },
    { name: 'literature' },
    { name: 'public_talks' },
    { name: 'public_preaching' },
    { name: 'jw_support' },
    { name: 'service_committee' },
    { name: 'maintenance_committee' }
  ]);

  await seed.assignments([
    { name: 'microphone' },
    { name: 'attendant' },
    { name: 'public_speaking' },
    { name: 'public_reading' },
    { name: 'midweek_chairman' },
    { name: 'midweek_speaking' },
    { name: 'weekend_chairman' },
    { name: 'qna_conducting' },
    { name: 'bible_study_conducting' }
  ]);

  const ROLES = [
    { name: 'elder' },
    { name: 'ministerial_servant' },
    { name: 'regular_pioneer' },
    { name: 'auxiliar_pioneer' },
    { name: 'special_pioneer' },
    { name: 'secretary' },
    { name: 'coordinator' },
    { name: 'service_overseer' },
    { name: 'group_overseer' },
    { name: 'group_auxiliar' },
    { name: 'lnm_overseer' }
  ] as const;

  type RoleName = (typeof ROLES)[number]['name'];

  await seed.roles([...ROLES]);

  const congregations = await seed.congregations(
    [
      {
        id: '33837',
        name: 'Villa Nueva',
        author_id: authorId,
        groups: [
          { name: 'Grupo 1' },
          { name: 'Grupo 2' },
          { name: 'Grupo 3' },
          { name: 'Grupo 4' }
        ]
      }
    ],
    {
      connect: { persons: [author.persons[0]] }
    }
  );

  const groups = await seed.groups((n) => n(6), {
    models: {
      groups: {
        data: {
          name: (ctx) => `Grupo ${++groupId}`
        }
      }
    },
    connect: {
      congregations: [congregations.congregations[0]]
    }
  });

  const persons = await seed.persons(
    (n) =>
      n(110, {
        gender: ({ seed }) => (copycat.bool(seed) ? 'Male' : 'Female'),
        first_name: ({ seed }) => copycat.firstName(seed),
        last_name: ({ seed }) => copycat.lastName(seed),
        email_address: ({ seed }) => copycat.email(seed),
        phone_number: ({ seed }) =>
          copycat.phoneNumber(seed, {
            prefixes: ['+57311', '+57321', '+57313']
          }),
        address: null,
        identity_provider_id: null,

        birth_date: ({ seed }) =>
          copycat.dateString(seed, { maxYear: 2015, minYear: 1950 }),

        baptism_date: ({ seed, data }) => {
          const age = differenceInYears(nowDate, data.birth_date!);

          if (age < 14) return null;

          return copycat.dateString(seed, {
            min: add(data.birth_date!, {
              years: int(14, age - 2)
            }),
            max: sub(nowDate, { years: 1.5 })
          });
        },

        publisher_date: ({ seed, data }) => {
          const age = differenceInYears(nowDate, data.birth_date!);
          const ageBaptized = differenceInYears(nowDate, data.baptism_date!);

          if (age < 6) return null;

          return copycat.dateString(seed, {
            min: add(data.birth_date!, {
              years: int(6, age > 7 ? age - ageBaptized - 2 : 6)
            }),
            max: sub(data.baptism_date!, { years: 1 })
          });
        },

        is_inactive: ({ data }) => {
          const age = differenceInYears(nowDate, data.birth_date!);

          if (age > 20 && age < 60 && inactiveCount < maxInactives) {
            inactiveCount++;

            return true;
          }

          return false;
        }
      }),
    {
      connect: true
    }
  );

  const { persons: personsList } = seed.$store;

  const getRole = (name: RoleName) => {
    const role = seed.$store.roles.find((role) => role.name === name);

    if (role) return role;

    throw new RangeError('Not found role: ' + name);
  };

  const elderRole = getRole('elder');
  const servantRole = getRole('ministerial_servant');
  const regularPioneerRole = getRole('regular_pioneer');
  const auxiliarPioneerRole = getRole('auxiliar_pioneer');

  const logs = [];

  for (const personRecord of personsList) {
    logs.push(
      `Persons: ${personRecord.id}, ${personRecord.publisher_date}, ${personRecord.baptism_date}, ${personRecord.is_inactive}`
    );

    if (!personRecord.publisher_date) continue;
    if (!personRecord.baptism_date) continue;
    if (personRecord.is_inactive) continue;

    const eldersDone = eldersCount >= maxElders;
    const servantsDone = servantsCount >= maxServants;
    const regularsDone = regularPioneerCount >= maxRegularPioneers;
    const auxiliarDone = auxiliarPioneerCount >= maxAuxiliarPioneers;
    const isMale = personRecord.gender === 'Male';
    let isElder = false;
    let isServant = false;
    let isRegularPioneer = false;
    let startingRegularDate: Date | undefined = undefined;

    const publisherMonths = differenceInMonths(
      nowDate,
      personRecord.publisher_date
    );
    const baptizedMonths = differenceInMonths(
      nowDate,
      personRecord.baptism_date
    );

    const canBeRegularPioneer =
      !regularsDone && baptizedMonths - 6 > 0 && int(1, 5) % 2 === 0;

    if (isMale && !eldersDone) {
      const restMonths = baptizedMonths - 12;
      const elderMonths = int(1, restMonths);
      const canBeElder = restMonths >= 0;

      if (canBeElder) {
        await seed.roles_to_persons((n) =>
          n(1, () => ({
            entity_id: null,
            entity_type: null,
            role_id: elderRole.id,
            person_id: personRecord.id,
            starts_at: sub(nowDate, { months: elderMonths })
          }))
        );
        eldersCount++;
        isElder = true;
      }
    }

    if (isMale && !isElder && !servantsDone) {
      const restMonths = baptizedMonths - 12;
      const servantsMonths = int(1, restMonths);
      const canBeServant = restMonths >= 0;

      if (canBeServant) {
        await seed.roles_to_persons((n) =>
          n(1, {
            entity_id: null,
            entity_type: null,
            role_id: servantRole.id,
            person_id: personRecord.id,
            starts_at: sub(nowDate, { months: servantsMonths })
          })
        );
        servantsCount++;
        isServant = true;
      }
    }

    if (canBeRegularPioneer) {
      const restMonths = baptizedMonths - 6;
      const pioneerMonths = int(1, restMonths);
      const startsAt = sub(nowDate, { months: pioneerMonths });

      await seed.roles_to_persons((n) =>
        n(1, {
          entity_id: null,
          entity_type: null,
          role_id: regularPioneerRole.id,
          person_id: personRecord.id,
          starts_at: startsAt
        })
      );
      regularPioneerCount++;
      isRegularPioneer = true;
      startingRegularDate = startsAt;
    }

    const canBeAuxiliarPioneer =
      !isRegularPioneer && !auxiliarDone && baptizedMonths - 2 > 0;

    if (canBeAuxiliarPioneer) {
      const isIndefinite = int(0, 5) % 2 === 0;
      const restMonths = baptizedMonths - 2;
      const pioneerMonths = int(1, restMonths);
      const startingDate = sub(nowDate, { months: pioneerMonths });

      await seed.roles_to_persons((n) =>
        n(1, {
          entity_id: null,
          entity_type: null,
          role_id: auxiliarPioneerRole.id,
          person_id: personRecord.id,
          starts_at: startingDate,
          finishes_at: isIndefinite
            ? null
            : add(startingDate, { months: int(2, 6) })
        })
      );
      auxiliarPioneerCount++;
    }

    await seed.reports(
      (n) =>
        n(publisherMonths, ({ index }) => {
          const reportDate = add(personRecord.publisher_date!, {
            months: index
          });
          const reportYear = getYear(reportDate);
          const reportMonth = getMonth(reportDate) + 1;
          const reportPeriod = `${reportYear}-${reportMonth}`;
          const reportServiceYear = `${reportMonth >= 9 ? reportYear : reportYear - 1}-${reportMonth >= 9 ? reportYear + 1 : reportYear}`;
          const isRegularNow =
            isRegularPioneer &&
            startingRegularDate &&
            isAfter(reportDate, startingRegularDate);

          return {
            comments: null,
            bible_studies: int(0, 3),
            hours: isRegularNow ? int(47, 55) : 1,
            period: reportPeriod,
            service_year: reportServiceYear
          };
        }),
      {
        connect: {
          persons: [personRecord]
        }
      }
    );
  }

  seed.$store.persons.forEach((person) => {
    if (!person.baptism_date || !person.publisher_date) return;

    if (isAfter(person.baptism_date, person.publisher_date))
      console.log(
        'OK!',
        person.first_name,
        person.last_name,
        `${differenceInYears(nowDate, person.publisher_date)} años publicador`,
        `${differenceInYears(nowDate, person.baptism_date)} años bautizado`,
        `Género: ${person.gender}`
      );
    else {
      console.error(
        'ERROR',
        person.first_name,
        person.last_name,
        'PUBLISHER_AT',
        person.publisher_date,
        'BAPTIZED_AT',
        person.baptism_date,
        'GENDER',
        person.gender
      );
    }
  });

  const content = JSON.stringify(
    seed.$store.persons.map((person) => {
      const roles = seed.$store.roles_to_persons
        .filter((record) => record.person_id === person.id)
        .map(
          (record) =>
            seed.$store.roles.find((role) => record.role_id === role.id)?.name
        );

      console.log('ROLES', roles);

      return {
        ...person,
        roles
      };
    }),
    null,
    2
  );

  console.log(JSON.stringify(logs, null, 2));

  if (existsSync(join(process.cwd(), './stores.json')))
    rmSync(join(process.cwd(), './stores.json'));

  writeFileSync(join(process.cwd(), './stores.json'), content, {
    encoding: 'utf8'
  });

  process.exit();
};

main();
