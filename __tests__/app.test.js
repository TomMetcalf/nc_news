const app = require('../app');
const request = require('supertest');
const seed = require('../db/seeds/seed');
const index = require('../db/data/test-data/index');
const connection = require('../db/connection');
const fs = require('fs/promises');

beforeEach(() => {
    return seed(index);
});

afterAll(() => {
    return connection.end();
});

describe('/api/topics', () => {
    test('GET - status: 200 - returns the correct information', () => {
        return request(app)
            .get('/api/topics')
            .expect(200)
            .then((response) => {
                expect(response.body.topics.length).toBe(3);
                response.body.topics.forEach((topic) => {
                    expect(typeof topic.slug).toBe('string');
                    expect(typeof topic.description).toBe('string');
                });
            });
    });
});

describe('/api', () => {
    test('GET - status: 200 - returns a JSON object with all available endpoints', () => {
        return fs
            .readFile(`${__dirname}/../endpoints.json`, 'utf8')
            .then((data) => {
                const expectedResponse = JSON.parse(data);
                return request(app)
                    .get('/api')
                    .expect(200)
                    .then((response) => {
                        expect(response.body).toEqual(expectedResponse);
                    });
            });
    });
    test('get - status: 404 - returns a error when endpoint is not found', () => {
        return request(app)
            .get('/api/nonsense')
            .expect(404)
            .then((response) => {
                expect(response.body.msg).toBe('not found!');
            });
    });
});

describe('/api/articles/:article_id', () => {
    test('GET - status: 200 - responds with article with specified id', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then((response) => {
                const article = response.body.article;
                expect(article.article_id).toBe(1);
                expect(article.title).toBe(
                    'Living in the shadow of a great man'
                );
                expect(article.topic).toBe('mitch');
                expect(article.author).toBe('butter_bridge');
                expect(article.body).toBe('I find this existence challenging');
                expect(article.created_at).toBe('2020-07-09T20:11:00.000Z');
                expect(article.votes).toBe(100);
                expect(article.article_img_url).toBe(
                    'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700'
                );
            });
    });
    test('GET - status: 400 - requested id is not valid', () => {
        return request(app)
            .get('/api/articles/nonsense')
            .expect(400)
            .then((response) => {
                expect(response.body).toEqual({ msg: 'Bad Request' });
            });
    });
    test('GET - status: 404 - request is valid but not found', () => {
        return request(app)
            .get('/api/articles/100')
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual({ msg: 'article not found!' });
            });
    });
});

describe('/api/articles/:article_id/comments', () => {
    test('GET - status: 200 - responds with an array of comments for the given article_id', () => {
        return request(app)
            .get('/api/articles/3/comments')
            .expect(200)
            .then((response) => {
                const comment = response.body.comment[0];
                expect(comment.article_id).toBe(3);
                expect(comment.comment_id).toBe(10);
                expect(comment.votes).toBe(0);
                expect(comment.created_at).toBe('2020-06-20T07:24:00.000Z');
                expect(comment.author).toBe('icellusedkars');
                expect(comment.body).toBe('git push origin master');
                expect(response.body.comment).toBeSortedBy('created_at', {
                    descending: false,
                });
            });
    });
    test('GET - status: 200 - responds with an empty array for an article_id that has no comments', () => {
        return request(app)
            .get('/api/articles/2/comments')
            .expect(200)
            .then((response) => {
                expect(response.body.comment).toEqual([]);
            });
    });
    test('GET - status: 404 - request is valid but not found', () => {
        return request(app)
            .get('/api/articles/100/comments')
            .expect(404)
            .then((response) => {
                expect(response.body).toEqual({ msg: 'article not found!' });
            });
    });
    test('GET - status: 400 - requested id is not valid', () => {
        return request(app)
            .get('/api/articles/nonsense/comments')
            .expect(400)
            .then((response) => {
                expect(response.body).toEqual({ msg: 'Bad Request' });
            });
    });
});
