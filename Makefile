psqlup:
	docker run --name postgres-db \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  -v $(PWD):/usr/share/data \
  -d postgres

psqlStop:
	docker stop postgres-db

psqlStart:
	docker start postgres-db

psqlRestart:
	docker restart postgres-db

psqlRemove:
	docker rm postgres-db

# connect running psql container
psql:
	docker exec -it postgres-db psql -U myuser -d mydatabase