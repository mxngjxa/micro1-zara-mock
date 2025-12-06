import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Interviews (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let interviewId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Clean database
    const dataSource = app.get(DataSource);
    await dataSource.query('DELETE FROM answers');
    await dataSource.query('DELETE FROM questions');
    await dataSource.query('DELETE FROM interviews');
    await dataSource.query('DELETE FROM users');

    // Register and Login to get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
      })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
      })
      .expect(201);

    const cookies = loginResponse.get('Set-Cookie');
    if (!cookies) throw new Error('No cookies set');

    const accessTokenCookie = cookies.find((c: string) =>
      c.startsWith('access_token='),
    );
    if (!accessTokenCookie) throw new Error('No access_token cookie');

    // Properly decode URL-encoded token if needed, though usually it's just the value
    authToken = accessTokenCookie.split(';')[0].split('=')[1];
    userId = loginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/interviews (POST) - should create interview', async () => {
    const response = await request(app.getHttpServer())
      .post('/interviews')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        job_role: 'Frontend Engineer',
        difficulty: 'JUNIOR',
        topics: ['React', 'JavaScript'],
        total_questions: 5,
      })
      .expect(201);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.id).toBeDefined();
    expect(response.body.data.questions).toHaveLength(5);

    interviewId = response.body.data.id;
  });

  it('/interviews/:id/start (POST) - should start interview', async () => {
    const response = await request(app.getHttpServer())
      .post(`/interviews/${interviewId}/start`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.room_name).toBe(`interview-${interviewId}`);
  });

  it('/interviews/:id (GET) - should get interview details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/interviews/${interviewId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.data.id).toBe(interviewId);
    expect(response.body.data.status).toBe('IN_PROGRESS');
  });

  it('/interviews/:id/complete (POST) - should complete interview', async () => {
    const response = await request(app.getHttpServer())
      .post(`/interviews/${interviewId}/complete`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(response.body.data.status).toBe('COMPLETED');
    expect(response.body.data.report).toBeDefined();
  });
});
