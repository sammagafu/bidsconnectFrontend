<template>
  <VerticalLayout>
    <b-row>
      <b-col xl="9">
        <UIComponentCard id="default" title="Default Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                :modules="[Autoplay]"
                :autoplay="defaultAutoplay"
                :loop="true"
                class="rounded"
              >
                <SwiperSlide>
                  <img :src="smallImg1" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg2" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid" />
                </SwiperSlide>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="navigation" title="Navigation & Pagination Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                :modules="[Autoplay, Navigation, Pagination]"
                :autoplay="defaultAutoplay"
                :loop="true"
                :navigation="defaultNavigation"
                :pagination="defaultPagination"
                class="rounded"
              >
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg6" alt="" class="img-fluid" />
                </SwiperSlide>

                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="pagination-dynamic" title="Pagination Dynamic Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                :modules="[Autoplay, Pagination]"
                :autoplay="defaultAutoplay"
                :loop="true"
                :pagination="defaultDynamicPagination"
                class="rounded"
              >
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg6" alt="" class="img-fluid" />
                </SwiperSlide>

                <div class="swiper-pagination dynamic-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="effect-fade" title="Effect Fade Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                class="rounded"
                :modules="[Autoplay, Pagination, EffectFade]"
                :autoplay="defaultAutoplay"
                :effect="'fade'"
                :loop="true"
                :pagination="defaultPagination"
              >
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid" />
                </SwiperSlide>

                <div class="swiper-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="effect-creative" title="Effect Creative Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                class="rounded"
                :modules="[Autoplay, Pagination, EffectCreative]"
                :grabCursor="true"
                :autoplay="defaultAutoplay"
                :effect="'creative'"
                :loop="true"
                :pagination="defaultPagination"
                :creativeEffect="{
                  prev: {
                    shadow: true,
                    translate: [0, 0, -400],
                  },
                  next: {
                    translate: ['100%', 0, 0],
                  },
                }"
              >
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid rounded" />
                </SwiperSlide>

                <div class="swiper-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="effect-flip" title="Effect Flip Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                :modules="[Autoplay, Pagination, EffectFlip]"
                :grabCursor="true"
                :autoplay="defaultAutoplay"
                :effect="'flip'"
                :loop="true"
                :pagination="defaultPagination"
              >
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid rounded" />
                </SwiperSlide>

                <div class="swiper-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="scrollbar" title="Scrollbar Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                :modules="[Autoplay, Pagination, Scrollbar]"
                :scrollbar="defaultScrollbar"
                :autoplay="defaultAutoplay"
                :loop="true"
                :pagination="defaultPagination"
              >
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid rounded" />
                </SwiperSlide>

                <div class="swiper-button-next"></div>
                <div class="swiper-button-prev"></div>
                <div class="swiper-scrollbar"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="vertical" title="Vertical Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                :modules="[Autoplay, Pagination]"
                :direction="'vertical'"
                :autoplay="defaultAutoplay"
                :loop="true"
                :pagination="defaultPagination"
                style="height: 320px"
              >
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid rounded" />
                </SwiperSlide>

                <div class="swiper-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="mousewheel" title="Mousewheel Control Swiper">
          <b-row>
            <b-col lg="6" class="mt-2">
              <Swiper
                class="rounded"
                :modules="[Autoplay, Pagination, Mousewheel]"
                :direction="'vertical'"
                :mousewheel="mousewheelEnabled"
                :autoplay="defaultAutoplay"
                :loop="true"
                :pagination="defaultPagination"
                style="height: 324px"
              >
                <SwiperSlide>
                  <img :src="smallImg3" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg4" alt="" class="img-fluid rounded" />
                </SwiperSlide>
                <SwiperSlide>
                  <img :src="smallImg5" alt="" class="img-fluid rounded" />
                </SwiperSlide>

                <div class="swiper-pagination"></div>
              </Swiper>
            </b-col>
          </b-row>
        </UIComponentCard>

        <UIComponentCard id="responsive" title="Responsive Breakpoints Swiper">
          <div class="mt-3">
            <Swiper
              class="rounded gallery-light pb-4"
              :modules="[Autoplay, Pagination]"
              :loop="true"
              :slidesPerView="1"
              :spaceBetween="10"
              :pagination="defaultPagination"
              :breakpoints="{
                768: {
                  slidesPerView: 2,
                  spaceBetween: 40,
                },
                1200: {
                  slidesPerView: 3,
                  spaceBetween: 50,
                },
              }"
            >
              <SwiperSlide>
                <img :src="smallImg1" alt="" class="img-fluid rounded" />
              </SwiperSlide>
              <SwiperSlide>
                <img :src="smallImg2" alt="" class="img-fluid rounded" />
              </SwiperSlide>
              <SwiperSlide>
                <img :src="smallImg3" alt="" class="img-fluid rounded" />
              </SwiperSlide>
              <SwiperSlide>
                <img :src="smallImg4" alt="" class="img-fluid rounded" />
              </SwiperSlide>
              <SwiperSlide>
                <img :src="smallImg5" alt="" class="img-fluid rounded" />
              </SwiperSlide>
              <SwiperSlide>
                <img :src="smallImg6" alt="" class="img-fluid rounded" />
              </SwiperSlide>

              <div class="swiper-pagination swiper-pagination-dark"></div>
            </Swiper>
          </div>
        </UIComponentCard>
      </b-col>

      <b-col xl="3">
        <AnchorNavigation :elements="anchorNavigation" />
      </b-col>
    </b-row>
  </VerticalLayout>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import {
  Autoplay,
  EffectCreative,
  EffectFade,
  EffectFlip,
  Mousewheel,
  Navigation,
  Pagination,
  Scrollbar,
} from 'swiper/modules';

import VerticalLayout from '@/layouts/VerticalLayout.vue';

import AnchorNavigation from '@/components/AnchorNavigation.vue';

import smallImg1 from '@/assets/images/small/img-1.jpg';
import smallImg2 from '@/assets/images/small/img-2.jpg';
import smallImg3 from '@/assets/images/small/img-3.jpg';
import smallImg4 from '@/assets/images/small/img-4.jpg';
import smallImg5 from '@/assets/images/small/img-5.jpg';
import smallImg6 from '@/assets/images/small/img-6.jpg';
import UIComponentCard from '@/components/UIComponentCard.vue';

const anchorNavigation = [
  {
    id: 'default',
    title: 'Default Swiper',
  },
  {
    id: 'navigation',
    title: 'Navigation & Pagination Swiper',
  },
  {
    id: 'pagination-dynamic',
    title: 'Pagination Dynamic Swiper',
  },
  {
    id: 'effect-fade',
    title: 'Effect Fade Swiper',
  },
  {
    id: 'effect-creative',
    title: 'Effect Creative Swiper',
  },
  {
    id: 'effect-flip',
    title: 'Effect Flip Swiper',
  },
  {
    id: 'scrollbar',
    title: 'Scrollbar Swiper',
  },
  {
    id: 'vertical',
    title: 'Vertical Swiper',
  },
  {
    id: 'mousewheel',
    title: 'Mousewheel Control Swiper',
  },
  {
    id: 'responsive',
    title: 'Responsive Breakpoints Swiper',
  },
];

const defaultAutoplay = { delay: 2500, disableOnInteraction: false } as any;
const defaultNavigation = { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } as any;
const defaultPagination = { el: '.swiper-pagination', clickable: true } as any;
const defaultDynamicPagination = { el: '.swiper-pagination', clickable: true, dynamicBullets: true } as any;
const defaultScrollbar = { hide: true } as any;
const mousewheelEnabled = true as any;
</script>
