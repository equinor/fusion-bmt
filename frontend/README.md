# Frontend file structure

One of the principles of GraphQL is that it's users can query for exactly what
they need and nothing more. This implies that we want to specify a unique query
or mutation for each GraphQL operation we perform, and we do not plan to be
able to reuse any of these queries or mutations. Consequently, we define the
queries and mutations in the files where they are being used, instead of
placing them in a common folder for all queries and mutations. Furthermore, in 
order to increase the readability of our code, we aim to define queries and
mutations in the bottom of the files where they are being used. 
