<html>
	<body>
		<h1>
			{{ [message.title|string] }}
		</h1>
		<hr>
		{{ 
			[body|text] 
		}}
		<div class="People">
			{{ 
			#if people
				#each people }}

						<li>
							{{ #unless first == 'Carl' }} 
								Mr. {{ [last|string] }}
							{{ /unless }}
							{{ #if first == 'Carl' }}
								Dr. {{ [first] [last|string] }}
							{{ /if }}
							{{ #if salary }}
								{{ [salary|currency:USD] }} 
							{{ /if }}
						</li>
				{{ /each
			/if
			}}
		</div>
		<div class="Others">
		<h3>Here is a list of people, in JSON format:</h3>
		<pre>{{ [people|json] }}</pre>


		{{ #if others }} The others are real. {{ /if }}
		{{ #if others == true  [others|string]  /if }}
		
		{{ #if others == people }} 
			Others is People
		{{ /if }}
		{{ #else }}
			{{ ['OTHERS ARE not people.'|lowercase] }}
		{{ /else }}	

		{{ ['I AM LOWERCASE.'|lowercase] }}
		{{ ['I AM upperCASE.'|uppercase] }}

		{{ #if others >= 2 }}{{ /if }}
		{{ #if others <= 4 }}{{ /if }}
		{{ #if 2 < 4 }} <p>2 < 4</p>	{{ /if }}
		{{ #if 2 != 4 }} <p>2 != 4</p>	{{ /if }}
		{{ #if 2.4 < 4 }} <p>2.4 < 4</p>	{{ /if }}
		{{ #if 2 > 4 }} <p>2 > 4</p>	{{ /if }}
		{{ #if 2 == 2 }} <p>2 == 2</p>	{{ /if }}
		{{ #if foo.bar.baz == 123 }} <p>baz == 123</p>	{{ /if }}
		</div>
	</body>
</html>