drop schema cccat14 cascade;
create schema cccat14;

create table cccat14.account (
account_id uuid,
name text,
email text,
cpf text,
car_plate text,
is_passenger boolean,
is_driver boolean,
password text,
password_algorithm text,
salt text
);

create table cccat14.ride (
ride_id uuid,
passenger_id uuid,
driver_id uuid,
status text,
fare numeric,
distance numeric,
from_lat numeric,
from_long numeric,
to_lat numeric,
to_long numeric,
date timestamp
);

create table cccat14.position (
position_id uuid primary key,
ride_id uuid,
lat numeric,
long numeric,
date timestamp);