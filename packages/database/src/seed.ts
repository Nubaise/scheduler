import { AppDataSource } from './data-source.js';
import { AlternativeProposal } from './entities/alternative-proposal.entity.js';
import { AppointmentRequest } from './entities/appointment-request.entity.js';
import { Appointment } from './entities/appointment.entity.js';
import { Availability } from './entities/availability.entity.js';
import { Department } from './entities/department.entity.js';
import { Faculty } from './entities/faculty.entity.js';
import { User } from './entities/user.entity.js';

async function seed(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const departmentRepository = AppDataSource.getRepository(Department);
    const userRepository = AppDataSource.getRepository(User);
    const facultyRepository = AppDataSource.getRepository(Faculty);
    const availabilityRepository = AppDataSource.getRepository(Availability);
    const requestRepository =
      AppDataSource.getRepository(AppointmentRequest);
    const proposalRepository =
      AppDataSource.getRepository(AlternativeProposal);
    const appointmentRepository = AppDataSource.getRepository(Appointment);

    // Department
    let department = await departmentRepository.findOne({
      where: { code: 'CSE' },
    });

    if (!department) {
      department = await departmentRepository.save(
        departmentRepository.create({
          code: 'CSE',
          name: 'Computer Science and Engineering',
        }),
      );
    }

    // Users
    async function findOrCreateUser(
      email: string,
      name: string,
      role: string,
    ): Promise<User> {
      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        return existingUser;
      }

      return userRepository.save(
        userRepository.create({
          email,
          name,
          role,
          status: 'ACTIVE',
        }),
      );
    }

    const admin = await findOrCreateUser(
      'admin@example.test',
      'FAS Development Admin',
      'ADMIN',
    );

    const facultyUser = await findOrCreateUser(
      'faculty@example.test',
      'FAS Development Faculty',
      'FACULTY',
    );

    const student = await findOrCreateUser(
      'student@example.test',
      'FAS Development Student',
      'STUDENT',
    );

    // Faculty
    const existingFaculty = await facultyRepository.findOne({
      where: { userId: facultyUser.id },
    });

    const faculty =
      existingFaculty ??
      (await facultyRepository.save(
        facultyRepository.create({
          userId: facultyUser.id,
          departmentId: department.id,
          status: 'ACTIVE',
        }),
      ));

    // Availability
    async function createAvailabilityIfMissing(
      startsAt: Date,
      endsAt: Date,
    ): Promise<void> {
      const existing = await availabilityRepository.findOne({
        where: {
          facultyId: faculty.id,
          startsAt,
          endsAt,
        },
      });

      if (!existing) {
        await availabilityRepository.save(
          availabilityRepository.create({
            facultyId: faculty.id,
            startsAt,
            endsAt,
            status: 'AVAILABLE',
          }),
        );
      }
    }

    await createAvailabilityIfMissing(
      new Date('2026-09-01T09:00:00Z'),
      new Date('2026-09-01T12:00:00Z'),
    );

    await createAvailabilityIfMissing(
      new Date('2026-09-02T13:00:00Z'),
      new Date('2026-09-02T16:00:00Z'),
    );

    // Appointment requests
    async function findOrCreateRequest(
      requestedStart: Date,
      requestedEnd: Date,
      status: string,
      expiresAt: Date | null,
    ): Promise<AppointmentRequest> {
      let request = await requestRepository.findOne({
        where: {
          studentId: student.id,
          facultyId: faculty.id,
          requestedStart,
          requestedEnd,
        },
      });

      if (!request) {
        request = await requestRepository.save(
          requestRepository.create({
            studentId: student.id,
            facultyId: faculty.id,
            requestedStart,
            requestedEnd,
            status,
            expiresAt,
          }),
        );
      }

      return request;
    }

    const pendingRequest = await findOrCreateRequest(
      new Date('2026-09-01T09:30:00Z'),
      new Date('2026-09-01T10:00:00Z'),
      'PENDING',
      new Date('2026-09-01T08:00:00Z'),
    );

    const alternativeRequest = await findOrCreateRequest(
      new Date('2026-09-02T13:30:00Z'),
      new Date('2026-09-02T14:00:00Z'),
      'PENDING',
      new Date('2026-09-02T12:00:00Z'),
    );

    // Alternative proposal
    const existingProposal = await proposalRepository.findOne({
      where: {
        appointmentRequestId: alternativeRequest.id,
      },
    });

    if (!existingProposal) {
      await proposalRepository.save(
        proposalRepository.create({
          appointmentRequestId: alternativeRequest.id,
          proposedStart: new Date('2026-09-02T14:30:00Z'),
          proposedEnd: new Date('2026-09-02T15:00:00Z'),
          status: 'PENDING',
          createdById: facultyUser.id,
        }),
      );
    }

    // Confirmed appointment request
    const confirmedRequest = await findOrCreateRequest(
      new Date('2026-09-01T10:30:00Z'),
      new Date('2026-09-01T11:00:00Z'),
      'APPROVED',
      null,
    );

    // Appointment
    const existingAppointment = await appointmentRepository.findOne({
      where: {
        appointmentRequestId: confirmedRequest.id,
      },
    });

    if (!existingAppointment) {
      await appointmentRepository.save(
        appointmentRepository.create({
          appointmentRequestId: confirmedRequest.id,
          studentId: student.id,
          facultyId: faculty.id,
          startsAt: new Date('2026-09-01T10:30:00Z'),
          endsAt: new Date('2026-09-01T11:00:00Z'),
          status: 'CONFIRMED',
        }),
      );
    }

    console.log('FAS development seed completed successfully.');
    console.log({
      departmentId: department.id,
      adminId: admin.id,
      facultyId: faculty.id,
      studentId: student.id,
      pendingRequestId: pendingRequest.id,
      alternativeRequestId: alternativeRequest.id,
      confirmedRequestId: confirmedRequest.id,
    });
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error: unknown) => {
  console.error('FAS development seed failed:', error);
  process.exitCode = 1;
});