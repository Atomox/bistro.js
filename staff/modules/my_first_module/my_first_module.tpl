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
					{{ #if first != last }}
						<li> {{ [first|string] [last|string] }} </li>
					{{ /if
				/each
			/if
			}}
		</div>
		<div class="Others">
		{{ #if others [others|string] }} The others are real. {{ /if }}
		{{ #if others == true  [others|string]  /if }}
		{{ #if others == people }} Others is People {{ /if }}
		{{ #if others != people }} Others are not people. {{ /if }}	
		{{ #if others >= 2 }}{{ /if }}
		{{ #if others <= 4 }}{{ /if }}
		{{ #if 2 < 4 }} <p>2 < 4</p>	{{ /if }}
		{{ #if 2 != 4 }} <p>2 != 4</p>	{{ /if }}
		{{ #if 2.4 < 4 }} <p>2.4 < 4</p>	{{ /if }}
		{{ #if 2 > 4 }} <p>2 > 4</p>	{{ /if }}
		{{ #if 2 == 2 }} <p>2 == 2</p>	{{ /if }}
		{{ #if foo.bar.baz == 123 }} <p>2 == 2</p>	{{ /if }}
		</div>
	</body>
</html>