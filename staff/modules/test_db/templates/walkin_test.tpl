	<h1>{{ [title] }}</h1>

	<ul>

	{{ #unless people }}
		<h2>Dave's not hear, man!</h2>
	{{ /unless }}

	Let's print this data:
	<pre>{{ [rows|json] }}</pre>

	{{ #each rows }}
		<li>{{ [id] [': '] [body] }}</li>
	{{ /each }}
	</ul>
