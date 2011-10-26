/**
 * Mersenne Twister:
 * 
 * This is a port of the Java version of the C-program for MT19937 to
 * JavaScript. I did this because I wanted a seedable Psuedo Random
 * Number Generator for javascript.
 * 
 * Orignally Coded by Takuji Nishimura, considering the suggestions by
 * Topher Cooper and Marc Rieffel in July-Aug. 1997.
 * 
 * Translated to Java by Michael Lecuyer January 30, 1999
 * Copyright (C) 1999 Michael Lecuyer
 * 
 * Translated to JavaScript by Josh 'CartLemmy' Merritt.
 * 
 * 
 * This library is free software; you can redistribute it and or
 * modify it under the terms of the GNU Library General Public
 * License as published by the Free Software Foundation; either
 * version 2 of the License, or (at your option) any later
 * version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Library General Public License for more details.
 * You should have received a copy of the GNU Library General
 * Public License along with this library; if not, write to the
 * Free Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
 * 02111-1307  USA
 * 
 * Makoto Matsumoto and Takuji Nishimura, the original authors
 * ask "When you use this, send an email to: matumoto@math.keio.ac.jp
 * with an appropriate reference to your work"  You might also point
 * out this was a translation.
 *
 * REFERENCE
 * M. Matsumoto and T. Nishimura,
 * "Mersenne Twister: A 623-Dimensionally Equidistributed Uniform
 * Pseudo-Random Number Generator",
 * ACM Transactions on Modeling and Computer Simulation,
 * Vol. 8, No. 1, January 1998, pp 3--30.
 * 
 * 
 * Example Usage:
 
var seed = 1020;
var r = new mersenne(seed);

// float between 0 and 1
alert(r.rand());

// 32 bit integer. Note that javascript integers are signed, so numbers
larger than 0x7FFFFFFF will be negative
alert(r.randInt());

 
 */


function mersenne(b){this.N=624;this.M=397;this.MATRIX_A=0x9908b0df;this.UPPER_MASK=0x80000000;this.LOWER_MASK=0x7fffffff;this.TEMPERING_MASK_B=0x9d2c5680;this.TEMPERING_MASK_C=0xefc60000;this.UMASK=0xffffffff;this.mt=[];this.mti=0;this.mag01=[];this.seed=function(a){this.mt=new Array(this.N);this.mt[0]=a&0xffffffff;for(this.mti=1;this.mti<this.N;this.mti++){this.mt[this.mti]=(69069*this.mt[this.mti-1])&0xffffffff}this.mag01=new Array(2);this.mag01[0]=0x0;this.mag01[1]=this.MATRIX_A};this.rand=function(){var r=this.randInt();return((r&0x7fffffff)/4294967294.0)+(r<0?0.5:0)};this.randInt=function(){var y;if(this.mti>=this.N){var a;for(a=0;a<this.N-this.M;a++){y=(this.mt[a]&this.UPPER_MASK)|(this.mt[a+1]&this.LOWER_MASK);this.mt[a]=this.mt[a+this.M]^(y>>>1)^this.mag01[y&0x1]}for(;a<this.N-1;a++){y=(this.mt[a]&this.UPPER_MASK)|(this.mt[a+1]&this.LOWER_MASK);this.mt[a]=this.mt[a+(this.M-this.N)]^(y>>>1)^this.mag01[y&0x1]}y=(this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);this.mt[this.N-1]=this.mt[this.M-1]^(y>>>1)^this.mag01[y&0x1];this.mti=0}y=this.mt[this.mti++];y^=y>>>11;y^=(y<<7)&this.TEMPERING_MASK_B;y^=(y<<15)&this.TEMPERING_MASK_C;y^=(y>>>18);return y};this.seed(b?b:(Math.random()*0x7FFFFFFF)|0)};