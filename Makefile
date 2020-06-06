PROJECT := invest_gui
VERSION := $(shell git describe --tags `git rev-list --tags --max-count=1`)

IMAGE_NAME := $(PROJECT)
AZURE_IMAGE_TAG := altdata.azurecr.io/invest/$(IMAGE_NAME):$(VERSION)

lint:
	npm run lint

build: lint
	docker build . -t $(IMAGE_NAME) --pull

deploy: build
	docker tag $(IMAGE_NAME):latest $(AZURE_IMAGE_TAG)
	docker push $(AZURE_IMAGE_TAG)

all: lint build

.DEFAULT_GOAL := all
