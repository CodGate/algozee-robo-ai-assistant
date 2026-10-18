CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`service` text NOT NULL,
	`brief` text NOT NULL,
	`deadline` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`created` text NOT NULL,
	`amount` integer DEFAULT 0 NOT NULL
);
