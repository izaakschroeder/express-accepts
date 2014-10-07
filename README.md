# accepts

Express middleware to help you manage the HTTP Accept header.

Basic usage:
```javascript
var app = express();
app.get('/api', accepts('application/json'), function(req, res) {
	// Only if Accept: application/json is true
	return res.status(200).send({ hello: 'world' });
});
```

Use fancier routing:
```javascript
var app = express();
app.get('/', accepts('text/html', 'application/json'));
app.get('/', accepts.on('text/html'), function(req, res) {
	return res.status(200).render('index');
});
app.get('/', accepts.on('application/json'), function(req, res) {
	return res.status(200).send({ hello: 'world' });
});
```
